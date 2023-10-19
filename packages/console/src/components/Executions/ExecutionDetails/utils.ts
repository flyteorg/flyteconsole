import { Identifier, ResourceType } from 'models/Common/types';
import {
  Execution,
  NodeExecution,
  TaskExecution,
} from 'models/Execution/types';
import { Routes } from 'routes/routes';
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
  taskExecutionDetails?: TaskExecution[],
): (string | null | undefined)[] {
  let reasons: string[] = [];
  taskExecutionDetails?.forEach?.(taskExecution => {
    const finalReasons = (
      taskExecution.closure.reasons?.length
        ? taskExecution.closure.reasons
        : [{ message: taskExecution.closure.reason }]
    ).filter(r => !!r);
    if (
      finalReasons &&
      finalReasons.some(eachReason => eachReason?.message?.trim() !== '')
    ) {
      reasons = reasons.concat(
        finalReasons.map(
          reason =>
            (reason.occurredAt
              ? `${formatDateUTC(timestampToDate(reason.occurredAt))} `
              : '') + reason.message,
        ),
      );
    }
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
