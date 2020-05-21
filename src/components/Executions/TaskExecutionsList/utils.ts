import { leftPaddedNumber } from 'common/formatters';
import { TaskExecution } from 'models';

/** Generates a unique name for a task execution, suitable for display in a
 * header and use as a child component key. The name is a combination of task
 * name and retry attempt (if it is not the first attempt).
 * Note: Names are not *globally* unique, just unique within a given `NodeExecution`
 */
export function getUniqueTaskExecutionName({ id }: TaskExecution) {
    const { name } = id.taskId;
    const { retryAttempt } = id;
    const suffix = retryAttempt > 0 ? ` (${retryAttempt + 1})` : '';
    return `${name}${suffix}`;
}

export function formatRetryAttempt(attempt: number): string {
    // Retry attempts are zero-based, so incrementing before formatting
    return `Attempt ${leftPaddedNumber(attempt + 1, 2)}`;
}
