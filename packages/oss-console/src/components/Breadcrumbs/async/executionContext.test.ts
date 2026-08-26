import { ResourceType } from '../../../models/Common/types';
import { Execution } from '../../../models/Execution/types';
import {
  isExecutionTaskOrWorkflow,
  getTaskOrWorkflowName,
  getTaskOrWorkflowVersion,
} from './executionContext';

const makeExecution = (overrides: {
  launchPlanResourceType: ResourceType;
  launchPlanName: string;
  launchPlanVersion: string;
  workflowIdName: string;
  workflowIdVersion: string;
}): Execution =>
  ({
    spec: {
      launchPlan: {
        resourceType: overrides.launchPlanResourceType,
        name: overrides.launchPlanName,
        version: overrides.launchPlanVersion,
      },
    },
    closure: {
      workflowId: {
        name: overrides.workflowIdName,
        version: overrides.workflowIdVersion,
      },
    },
  }) as unknown as Execution;

describe('executionContext helpers', () => {
  const taskExecution = makeExecution({
    launchPlanResourceType: ResourceType.TASK,
    launchPlanName: 'my-task',
    launchPlanVersion: 'task-v1',
    workflowIdName: 'my-workflow',
    workflowIdVersion: 'wf-v1',
  });

  const workflowExecution = makeExecution({
    launchPlanResourceType: ResourceType.WORKFLOW,
    launchPlanName: 'my-launch-plan',
    launchPlanVersion: 'lp-v1',
    workflowIdName: 'my-workflow',
    workflowIdVersion: 'wf-v1',
  });

  describe('isExecutionTaskOrWorkflow', () => {
    it('returns TASK when launchPlan resourceType is TASK', () => {
      expect(isExecutionTaskOrWorkflow(taskExecution)).toBe(ResourceType.TASK);
    });

    it('returns WORKFLOW when launchPlan resourceType is WORKFLOW', () => {
      expect(isExecutionTaskOrWorkflow(workflowExecution)).toBe(ResourceType.WORKFLOW);
    });
  });

  describe('getTaskOrWorkflowName', () => {
    it('returns launchPlan name for task executions', () => {
      expect(getTaskOrWorkflowName(taskExecution)).toBe('my-task');
    });

    it('returns workflowId name for workflow executions', () => {
      expect(getTaskOrWorkflowName(workflowExecution)).toBe('my-workflow');
    });
  });

  describe('getTaskOrWorkflowVersion', () => {
    it('returns launchPlan version for task executions', () => {
      expect(getTaskOrWorkflowVersion(taskExecution)).toBe('task-v1');
    });

    it('returns workflowId version for workflow executions', () => {
      expect(getTaskOrWorkflowVersion(workflowExecution)).toBe('wf-v1');
    });
  });
});
