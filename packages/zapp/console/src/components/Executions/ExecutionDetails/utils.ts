import { Identifier, ResourceType } from 'models/Common/types';
import { Execution, TaskExecution, NodeExecution } from 'models/Execution/types';
import { Routes } from 'routes/routes';
import { PaginatedEntityResponse } from 'models/AdminEntity/types';

export function isSingleTaskExecution(execution: Execution) {
  return execution.spec.launchPlan.resourceType === ResourceType.TASK;
}

export function getExecutionSourceId(execution: Execution): Identifier {
  return isSingleTaskExecution(execution)
    ? execution.spec.launchPlan
    : execution.closure.workflowId;
}

export function getExecutionBackLink(execution: Execution): string {
  const { project, domain, name } = getExecutionSourceId(execution);
  return isSingleTaskExecution(execution)
    ? Routes.TaskDetails.makeUrl(project, domain, name)
    : Routes.WorkflowDetails.makeUrl(project, domain, name);
}

export function getTaskExecutionDetailReasons(
  taskExecutionDetails?: PaginatedEntityResponse<TaskExecution>,
): (string | null | undefined)[] {
  return taskExecutionDetails?.entities.map((taskExecution) => taskExecution.closure.reason) || [];
}

export function isChildGroupsFetched(
  scopedId: string,
  nodeExecutionsById: Dictionary<NodeExecution>,
): boolean {
  return Object.values(nodeExecutionsById).find((exe) => exe.fromUniqueParentId === scopedId)
    ? true
    : false;
}
