import { Identifier, ResourceType } from 'models/Common/types';
import {
  Execution,
  NodeExecution,
  TaskExecution,
} from 'models/Execution/types';
import { Routes } from 'routes/routes';
import { PaginatedEntityResponse } from 'models/AdminEntity/types';
import { compareTimestampsAscending, timestampToDate } from 'common/utils';
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
  const reasons = (
    taskExecutionDetails?.entities.map(
      taskExecution => taskExecution.closure.reasons || [],
    ) || []
  )
    .flat()
    .sort((a, b) => {
      if (!a || !a.occurredAt) return -1;
      if (!b || !b.occurredAt) return 1;
      return compareTimestampsAscending(a.occurredAt, b.occurredAt);
    });
  return reasons.map(
    reason =>
      (reason.occurredAt
        ? formatDateUTC(timestampToDate(reason.occurredAt)) + '\n'
        : '') + reason.message,
  );
}

export function isChildGroupsFetched(
  scopedId: string,
  nodeExecutionsById: Dictionary<NodeExecution>,
): boolean {
  return Object.values(nodeExecutionsById).some(
    v => v?.fromUniqueParentId === scopedId,
  );
}
