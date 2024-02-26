import { Binding, ResourceType, TaskLog } from '../../models/Common/types';
import {
  NodeExecution,
  NodeExecutionIdentifier,
  TaskExecutionIdentifier,
  WorkflowExecutionIdentifier,
} from '../../models/Execution/types';
import { LaunchPlan } from '../../models/Launch/types';
import { TaskNode } from '../../models/Node/types';
import { Task } from '../../models/Task/types';
import { Workflow } from '../../models/Workflow/types';
import { testDomain, testProject } from './constants';

interface TaskNodeIdsResult {
  id: string;
  taskNode: Pick<TaskNode, 'referenceId'>;
}
/** Helper for generating id fields used in a `Task` record. */
export function taskNodeIds(id: string, task: Task): TaskNodeIdsResult {
  return {
    id,
    taskNode: { referenceId: { ...task.id } },
  };
}

/** Generates a binding indicating consumption of outputs from an upstream node. */
export function bindingFromNode(
  inputName: string,
  upstreamNodeId: string,
  upstreamInputName: string,
): Binding {
  return {
    var: inputName,
    binding: {
      promise: {
        nodeId: upstreamNodeId,
        var: upstreamInputName,
      },
    },
  };
}

/** Generates a default `LaunchPlan` for a given `Workflow`. It will have an identical
 * `name` and `version`, no default/fixed inputs and will use a dummy `role` value.
 */
export function makeDefaultLaunchPlan(workflow: Workflow): LaunchPlan {
  return {
    id: {
      resourceType: ResourceType.LAUNCH_PLAN,
      project: testProject,
      domain: testDomain,
      name: workflow.id.name,
      version: workflow.id.version,
    },
    spec: {
      defaultInputs: { parameters: {} },
      entityMetadata: { notifications: [], schedule: {} },
      fixedInputs: { literals: {} },
      role: 'defaultRole',
      workflowId: { ...workflow.id },
    },
  };
}

/** Combines parent `Execution` id and `nodeId` into a `NodeExecutionIdentifier` */
export function nodeExecutionId(
  executionId: WorkflowExecutionIdentifier,
  nodeId: string,
): NodeExecutionIdentifier {
  return {
    nodeId,
    executionId: { ...executionId },
  };
}

/** Generates a set of dummy log links for use in a `TaskExecution`. */
export function sampleLogs(): TaskLog[] {
  return [
    { name: 'Kubernetes Logs', uri: 'http://localhost/k8stasklog' },
    { name: 'User Logs', uri: 'http://localhost/containerlog' },
    { name: 'AWS Batch Logs', uri: 'http://localhost/awsbatchlog' },
    { name: 'Other Custom Logs', uri: 'http://localhost/customlog' },
  ];
}

/** Combines the needed fields from a parent `NodeExecution`, `Task` and `retryAttempt`
 * into a `TaskExecutionIdentifier`.
 */
export function taskExecutionId(
  nodeExecution: NodeExecution,
  task: Task,
  retryAttempt = 0,
): TaskExecutionIdentifier {
  return {
    retryAttempt,
    nodeExecutionId: { ...nodeExecution.id },
    taskId: { ...task.id },
  };
}
