import { NotFoundError, useFetchableData } from '@flyteconsole/components';
import { SortDirection } from '@flyteconsole/flyteidl';
import { NamedEntityIdentifier } from 'models/Common/types';
import { listTasks } from 'models/Task/api';
import { taskSortFields } from '@flyteconsole/ui-atoms';
import { Task } from 'models/Task/types';

async function fetchLatestTaskVersion(id: NamedEntityIdentifier) {
  const { entities } = await listTasks(id, {
    limit: 1,
    sort: {
      key: taskSortFields.createdAt,
      direction: SortDirection.DESCENDING,
    },
  });
  if (entities.length === 0) {
    throw new NotFoundError(`Latest version for task ${id.project}/${id.domain}/${id.name}`);
  }
  return entities[0];
}

/** A hook for fetching the latest version of a task, equivalent to listing
 * tasks for a project/domain/name with limit=1
 */
export function useLatestTaskVersion(taskId: NamedEntityIdentifier) {
  return useFetchableData(
    {
      debugName: 'LatestTaskVersion',
      doFetch: fetchLatestTaskVersion,
      defaultValue: {} as Task,
      useCache: true,
    },
    taskId,
  );
}
