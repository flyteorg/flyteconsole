import Core from '@clients/common/flyteidl/core';
import { Execution } from '../../../../models/Execution/types';

// Mock the SimpleCacheCallbackManager
jest.mock('@clients/primitives/SimpleCache/SimpleCacheCallbackManager', () => ({
  SimpleCacheCallbackManager: jest.fn().mockImplementation(() => ({
    getCachedOrFetch: jest.fn((_key: string, fn: () => Promise<Execution>) => fn()),
  })),
}));

// Mock the execution API
const mockGetExecution = jest.fn();
jest.mock('../../../../models/Execution/api', () => ({
  getExecution: (...args: unknown[]) => mockGetExecution(...args),
  listExecutions: jest.fn(),
}));

// Mock the routes
jest.mock('../../../../routes/routes', () => ({
  Routes: {
    WorkflowDetails: {
      makeUrl: jest.fn((project: string, domain: string, name: string) =>
        `/projects/${project}/domains/${domain}/workflows/${name}`),
    },
    TaskDetails: {
      makeUrl: jest.fn((project: string, domain: string, name: string) =>
        `/projects/${project}/domains/${domain}/tasks/${name}`),
    },
    ExecutionDetails: {
      makeUrl: jest.fn(({ project, domain, name }: { project: string; domain: string; name: string }) =>
        `/projects/${project}/domains/${domain}/executions/${name}`),
    },
    EntityVersionDetails: {
      makeUrl: jest.fn(),
    },
  },
}));

// Import after mocking
import {
  executonTaskWorkFlowNameAsyncValue,
  executonTaskWorkFlowNameAsyncSelfLink,
  executonNamedEntityAsyncValue,
} from '../executionContext';

/**
 * Creates a mock execution where the launch plan name differs from the workflow name.
 * This simulates the bug scenario where:
 * - Launch plan name: 'hello_world_lp'
 * - Actual workflow name: 'hello_world_wf'
 */
const createMockExecutionWithDifferentNames = (): Execution => ({
  id: {
    project: 'flytesnacks',
    domain: 'development',
    name: 'wf-execution-001',
  },
  spec: {
    launchPlan: {
      resourceType: Core.ResourceType.LAUNCH_PLAN,
      project: 'flytesnacks',
      domain: 'development',
      name: 'hello_world_lp', // Launch plan name
      version: '2025-04-09-15-56-08',
    },
    inputs: { literals: {} },
    metadata: {
      mode: 0,
      principal: 'user',
      nesting: 0,
    },
    notifications: { notifications: [] },
  },
  closure: {
    workflowId: {
      resourceType: Core.ResourceType.WORKFLOW,
      project: 'flytesnacks',
      domain: 'development',
      name: 'hello_world_wf', // Actual workflow name (different!)
      version: '2025-04-09-15-56-08',
    },
    phase: 4, // ABORTED
    createdAt: { seconds: { low: 1732000000, high: 0, unsigned: false }, nanos: 0 },
    startedAt: { seconds: { low: 1732000000, high: 0, unsigned: false }, nanos: 0 },
  },
});

/**
 * Creates a mock execution for a task (not a workflow)
 */
const createMockTaskExecution = (): Execution => ({
  id: {
    project: 'test-project',
    domain: 'development',
    name: 'task-execution-001',
  },
  spec: {
    launchPlan: {
      resourceType: Core.ResourceType.LAUNCH_PLAN,
      project: 'test-project',
      domain: 'development',
      name: 'my-task-launch-plan',
      version: 'v1',
    },
    inputs: { literals: {} },
    metadata: {
      mode: 0,
      principal: 'user',
      nesting: 0,
    },
    notifications: { notifications: [] },
  },
  closure: {
    workflowId: {
      resourceType: Core.ResourceType.TASK,
      project: 'test-project',
      domain: 'development',
      name: 'my-actual-task',
      version: 'v1',
    },
    phase: 3, // SUCCEEDED
    createdAt: { seconds: { low: 1732000000, high: 0, unsigned: false }, nanos: 0 },
    startedAt: { seconds: { low: 1732000000, high: 0, unsigned: false }, nanos: 0 },
  },
});

describe('executionContext breadcrumb functions', () => {
  const mockBreadcrumb = {
    projectId: 'flytesnacks',
    domainId: 'development',
    value: '',
    defaultValue: () => '',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('executonTaskWorkFlowNameAsyncValue', () => {
    it('should return the workflow name from closure.workflowId, NOT the launch plan name', async () => {
      const mockExecution = createMockExecutionWithDifferentNames();
      mockGetExecution.mockResolvedValue(mockExecution);

      const mockLocation = {
        pathname: '/projects/flytesnacks/domains/development/executions/wf-execution-001',
      } as Location;

      const result = await executonTaskWorkFlowNameAsyncValue(mockLocation, mockBreadcrumb as any);

      // Should return the WORKFLOW name, not the launch plan name
      expect(result).toBe('hello_world_wf');
      // Should NOT return the launch plan name
      expect(result).not.toBe('hello_world_lp');
    });

    it('should return the task name for task executions', async () => {
      const mockExecution = createMockTaskExecution();
      mockGetExecution.mockResolvedValue(mockExecution);

      const mockLocation = {
        pathname: '/projects/test-project/domains/development/executions/task-execution-001',
      } as Location;

      const result = await executonTaskWorkFlowNameAsyncValue(mockLocation, {
        ...mockBreadcrumb,
        projectId: 'test-project',
      } as any);

      expect(result).toBe('my-actual-task');
      expect(result).not.toBe('my-task-launch-plan');
    });
  });

  describe('executonNamedEntityAsyncValue', () => {
    it('should return "workflows" for workflow executions', async () => {
      const mockExecution = createMockExecutionWithDifferentNames();
      mockGetExecution.mockResolvedValue(mockExecution);

      const mockLocation = {
        pathname: '/projects/flytesnacks/domains/development/executions/wf-execution-001',
      } as Location;

      const result = await executonNamedEntityAsyncValue(mockLocation, mockBreadcrumb as any);

      expect(result).toBe('workflows');
    });

    it('should return "tasks" for task executions', async () => {
      const mockExecution = createMockTaskExecution();
      mockGetExecution.mockResolvedValue(mockExecution);

      const mockLocation = {
        pathname: '/projects/test-project/domains/development/executions/task-execution-001',
      } as Location;

      const result = await executonNamedEntityAsyncValue(mockLocation, {
        ...mockBreadcrumb,
        projectId: 'test-project',
      } as any);

      expect(result).toBe('tasks');
    });
  });

  describe('executonTaskWorkFlowNameAsyncSelfLink', () => {
    it('should generate link to the actual workflow, not the launch plan', async () => {
      const mockExecution = createMockExecutionWithDifferentNames();
      mockGetExecution.mockResolvedValue(mockExecution);

      const mockLocation = {
        pathname: '/projects/flytesnacks/domains/development/executions/wf-execution-001',
      } as Location;

      const result = await executonTaskWorkFlowNameAsyncSelfLink(mockLocation, mockBreadcrumb as any);

      // Should link to the workflow details page with the WORKFLOW name
      expect(result).toContain('hello_world_wf');
      expect(result).toContain('/workflows/');
      // Should NOT contain the launch plan name
      expect(result).not.toContain('hello_world_lp');
    });

    it('should generate link to task details for task executions', async () => {
      const mockExecution = createMockTaskExecution();
      mockGetExecution.mockResolvedValue(mockExecution);

      const mockLocation = {
        pathname: '/projects/test-project/domains/development/executions/task-execution-001',
      } as Location;

      const result = await executonTaskWorkFlowNameAsyncSelfLink(mockLocation, {
        ...mockBreadcrumb,
        projectId: 'test-project',
      } as any);

      expect(result).toContain('my-actual-task');
      expect(result).toContain('/tasks/');
      expect(result).not.toContain('my-task-launch-plan');
    });
  });

  describe('Bug scenario: Launch plan name differs from workflow name', () => {
    /**
     * This test verifies the fix for the bug where:
     * 1. User is on Launch Plan page showing 'hello_world_lp'
     * 2. User clicks into an execution
     * 3. Breadcrumb should show the WORKFLOW name 'hello_world_wf'
     * 4. NOT the launch plan name 'hello_world_lp'
     *
     * Before the fix, clicking the breadcrumb would navigate to:
     *   /workflows/hello_world_lp (empty page - wrong!)
     *
     * After the fix, clicking the breadcrumb navigates to:
     *   /workflows/hello_world_wf (correct workflow page)
     */
    it('should use workflow name in breadcrumb, not launch plan name', async () => {
      const mockExecution = createMockExecutionWithDifferentNames();
      mockGetExecution.mockResolvedValue(mockExecution);

      const mockLocation = {
        pathname: '/projects/flytesnacks/domains/development/executions/wf-execution-001',
      } as Location;

      // Get the workflow/task name shown in breadcrumb
      const breadcrumbName = await executonTaskWorkFlowNameAsyncValue(mockLocation, mockBreadcrumb as any);

      // Get the self-link URL when clicking the breadcrumb
      const selfLinkUrl = await executonTaskWorkFlowNameAsyncSelfLink(mockLocation, mockBreadcrumb as any);

      // Verify the breadcrumb shows the correct workflow name
      expect(breadcrumbName).toBe('hello_world_wf');

      // Verify clicking the breadcrumb navigates to the correct workflow page
      expect(selfLinkUrl).toBe('/projects/flytesnacks/domains/development/workflows/hello_world_wf');

      // Verify we're NOT using the launch plan name
      expect(breadcrumbName).not.toBe('hello_world_lp');
      expect(selfLinkUrl).not.toContain('hello_world_lp');
    });
  });
});
