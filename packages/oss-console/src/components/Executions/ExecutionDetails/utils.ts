import { ResourceType } from '../../../models/Common/types';
import { Execution, NodeExecution, TaskExecution } from '../../../models/Execution/types';
import { timestampToDate } from '../../../common/utils';
import { formatDateLocalTimezone } from '../../../common/formatters';

export function isSingleTaskExecution(execution: Execution) {
  return execution.spec.launchPlan.resourceType === ResourceType.TASK;
}

export function getTaskExecutionDetailReasons(
  taskExecutionDetails?: TaskExecution[],
): (string | null | undefined)[] {
  let reasons: string[] = [];
  taskExecutionDetails?.forEach?.((taskExecution) => {
    const finalReasons = (
      taskExecution.closure.reasons?.length
        ? taskExecution.closure.reasons
        : [{ message: taskExecution.closure.reason }]
    ).filter((r) => !!r);
    if (finalReasons && finalReasons.some((eachReason) => eachReason?.message?.trim() != '')) {
      reasons = reasons.concat(
        finalReasons.map(
          (reason) =>
            (reason.occurredAt
              ? `${formatDateLocalTimezone(timestampToDate(reason.occurredAt))} `
              : '') + reason.message,
        ),
      );
    }
  });
  return reasons;
}
