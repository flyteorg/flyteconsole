import Core from '@clients/common/flyteidl/core';
import { Execution } from '../../../../models/Execution/types';
import {
  executonTaskWorkFlowNameAsyncValue,
  executonTaskWorkFlowNameAsyncSelfLink,
  executonNamedEntityAsyncValue,
  executionTaskWorkflowVersions,
} from '../executionContext';

jest.mock('@clients/primitives/SimpleCache/SimpleCacheCallbackManager', () => ({
  SimpleCacheCallbackManager: jest.fn().mockImplementation(() => ({
    getCachedOrFetch: jest.fn((_key: string, fn: () => Promise<Execution>) => fn()),
  })),
}));

const mockGetExecution = jest.fn();
jest.mock('../../../../models/Execution/api', () => ({
  getExecution: (...args: unknown[]) => mockGetExecution(...args),
  listExecutions: jest.fn(),
}));

const mockFetchVersions = jest.fn();
jest.mock('../fn', () => ({
  fetchVersions: (...args: unknown[]) => mockFetchVersions(...args),
}));

const createMockExecutionWithDifferentNames = (): Execution => ({
  id: {
    project: 'execution-project',
    domain: 'execution-domain',
    name: 'wf-execution-001',
  },
  spec: {
    launchPlan: {
      resourceType: Core.ResourceType.LAUNCH_PLAN,
      project: 'launch-plan-project',
      domain: 'launch-plan-domain',
      name: 'hello_world_lp',
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
      project: 'workflow-project',
      domain: 'workflow-domain',
      name: 'hello_world_wf',
      version: '2025-04-09-15-56-08',
    },
    phase: 4,
    createdAt: { seconds: { low: 1732000000, high: 0, unsigned: false }, nanos: 0 },
    startedAt: { seconds: { low: 1732000000, high: 0, unsigned: false }, nanos: 0 },
  },
});

const createMockTaskExecution = (): Execution => ({
  id: {
    project: 'test-project',
    domain: 'development',
    name: 'task-execution-001',
  },
  spec: {
    launchPlan: {
      resourceType: Core.ResourceType.TASK,
      project: 'test-project',
      domain: 'development',
      name: 'my-actual-task',
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
      resourceType: Core.ResourceType.WORKFLOW,
      project: 'test-project',
      domain: 'development',
      name: 'my-actual-task-single-task',
      version: 'v1',
    },
    phase: 3,
    createdAt: { seconds: { low: 1732000000, high: 0, unsigned: false }, nanos: 0 },
    startedAt: { seconds: { low: 1732000000, high: 0, unsigned: false }, nanos: 0 },
  },
});

describe('executionContext breadcrumb functions', () => {
  const mockBreadcrumb = {
    projectId: 'workflow-domain',
    domainId: 'browsing-domain',
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

      expect(result).toBe('hello_world_wf');
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
      expect(result).not.toBe('my-actual-task-single-task');
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

      const result = await executonTaskWorkFlowNameAsyncSelfLink(
        mockLocation,
        mockBreadcrumb as any,
      );

      expect(result).toBe(
        '/projects/workflow-project/domains/workflow-domain/workflows/hello_world_wf',
      );
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
      expect(result).not.toContain('my-actual-task-single-task');
    });

    it('fetches workflow versions in the workflow project and domain', async () => {
      mockGetExecution.mockResolvedValue(createMockExecutionWithDifferentNames());
      mockFetchVersions.mockResolvedValue({ entities: [] });
      const location = {
        pathname:
          '/projects/execution-project/domains/execution-domain/executions/wf-execution-001',
      } as Location;

      await executionTaskWorkflowVersions(location, mockBreadcrumb as any);

      expect(mockFetchVersions).toHaveBeenCalledWith({
        project: 'workflow-project',
        domain: 'workflow-domain',
        name: 'hello_world_wf',
        resourceType: Core.ResourceType.WORKFLOW,
      });
    });
  });
});
