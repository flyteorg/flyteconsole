// import { Task } from 'models/Task/types';

import { NamedEntity } from 'models/Common/types';
import { TaskExecutionState } from 'models/Task/enums';
import { Task } from 'models/Task/types';

function isTaskStateArchive(task: NamedEntity): boolean {
  const state = task?.metadata?.state ?? null;
  return !!state && state === TaskExecutionState.NAMED_ENTITY_ARCHIVED;
}

export function isTaskArchived(task: NamedEntity): boolean {
  return isTaskStateArchive(task);
}
