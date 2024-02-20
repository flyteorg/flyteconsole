import Event from '@clients/common/flyteidl/event';
import {
  ExternalResource,
  ExternalResourcesByPhase,
  TaskExecution,
} from '../../../models/Execution/types';
import { leftPaddedNumber } from '../../../common/formatters';
import { TaskExecutionPhase } from '../../../models/Execution/enums';

/** Generates a unique name for a task execution, suitable for display in a
 * header and use as a child component key. The name is a combination of task
 * name and retry attempt (if it is not the first attempt).
 * Note: Names are not *globally* unique, just unique within a given `NodeExecution`
 */
export function getUniqueTaskExecutionName({ id }: TaskExecution) {
  const { name } = id.taskId;
  const { retryAttempt } = id;
  const suffix = retryAttempt && retryAttempt > 0 ? ` (${retryAttempt + 1})` : '';
  return `${name}${suffix}`;
}

export function formatRetryAttempt(attempt: number | string | undefined): string {
  let parsed = typeof attempt === 'number' ? attempt : Number.parseInt(`${attempt}`, 10);
  if (Number.isNaN(parsed)) {
    parsed = 0;
  }

  // Retry attempts are zero-based, so incrementing before formatting
  return `Attempt ${leftPaddedNumber(parsed + 1, 2)}`;
}

export const getGroupedExternalResources = (resources?: Event.IExternalResourceInfo[]) => {
  if (!resources?.length) {
    return;
  }
  const erByPhase: ExternalResourcesByPhase = new Map();

  // sort output sample [0-2, 0-1, 0, 1, 2], where 0-1 means index = 0 retry = 1
  resources.sort((a, b) => {
    const aIndex = a.index ?? 0;
    const bIndex = b.index ?? 0;
    if (aIndex !== bIndex) {
      // return smaller index first
      return aIndex - bIndex;
    }

    const aRetry = a.retryAttempt ?? 0;
    const bRetry = b.retryAttempt ?? 0;
    return bRetry - aRetry;
  });

  let lastIndex = -1;
  for (let i = 0; i < resources.length; i++) {
    const item = resources[i];
    // skip, as we already added final retry to data
    if (item.index !== lastIndex) {
      const phase = item.phase ?? TaskExecutionPhase.UNDEFINED;
      const currentValue = erByPhase.get(phase);

      erByPhase.set(phase, currentValue ? [...currentValue, item] : [item]);

      lastIndex = item.index ?? 0;
    }
  }

  return erByPhase;
};

export const getTaskRetryAtemptsForIndex = (
  resources: ExternalResource[],
  taskIndex: number | null,
): ExternalResource[] => {
  // check spesifically for null values, to make sure we're not skipping logs for 0 index
  if (taskIndex === null) {
    return [];
  }

  const filtered = resources.filter((a) => {
    const index = a.index ?? 0;
    return index === taskIndex;
  });

  // sort output sample [0-2, 0-1, 0, 1, 2], where 0-1 means index = 0 retry = 1
  filtered.sort((a, b) => {
    const aIndex = a.index ?? 0;
    const bIndex = b.index ?? 0;
    if (aIndex !== bIndex) {
      // return smaller index first
      return aIndex - bIndex;
    }

    const aRetry = a.retryAttempt ?? 0;
    const bRetry = b.retryAttempt ?? 0;
    return bRetry - aRetry;
  });
  return filtered;
};

export function getTaskLogName(taskName: string, taskLogName: string): string {
  const lastDotIndex = taskName.lastIndexOf('.');
  const prefix = lastDotIndex !== -1 ? taskName.slice(lastDotIndex + 1) : taskName;
  const firstDahIndex = taskLogName.indexOf('-');
  const suffix = firstDahIndex !== -1 ? taskLogName.slice(firstDahIndex) : '';
  return `${prefix}${suffix}`;
}
