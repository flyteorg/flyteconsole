import { Identifier, ResourceType } from 'models/Common/types';
import {
  Execution,
  NodeExecution,
  TaskExecution,
} from 'models/Execution/types';
import { Routes } from 'routes/routes';
import { PaginatedEntityResponse } from 'models/AdminEntity/types';
import { timestampToDate } from 'common';
import { formatDateUTC } from 'common/formatters';

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
  let reasons: string[] = [];
  taskExecutionDetails?.entities.forEach(taskExecution => {
    if (taskExecution.closure.reasons)
      reasons = reasons.concat(
        taskExecution.closure.reasons.map(
          reason =>
            (reason.occurredAt
              ? formatDateUTC(timestampToDate(reason.occurredAt)) + ' '
              : '') + reason.message,
        ),
      );
    else if (taskExecution.closure.reason)
      reasons.push(taskExecution.closure.reason);
  });
  return reasons;
}

export function isChildGroupsFetched(
  scopedId: string,
  nodeExecutionsById: Dictionary<NodeExecution>,
): boolean {
  return Object.values(nodeExecutionsById).some(
    v => v?.fromUniqueParentId === scopedId,
  );
}
