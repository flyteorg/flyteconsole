import { NamedEntity } from 'models/Common/types';
import { TaskExecutionState } from 'models/Task/enums';

function isTaskStateArchive(task: NamedEntity): boolean {
  const state = task?.metadata?.state ?? null;
  return !!state && state === TaskExecutionState.NAMED_ENTITY_ARCHIVED;
}

export function isTaskArchived(task: NamedEntity): boolean {
  return isTaskStateArchive(task);
}
