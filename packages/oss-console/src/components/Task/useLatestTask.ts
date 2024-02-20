import NotFoundError from '@clients/common/Errors/NotFoundError';
import { SortDirection } from '@clients/common/types/adminEntityTypes';
import { QueryType } from '../data/types';
import { NamedEntityIdentifier } from '../../models/Common/types';
import { listTasks } from '../../models/Task/api';
import { taskSortFields } from '../../models/Task/constants';

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

export function makeLatestTaskVersionQuery(id: NamedEntityIdentifier) {
  return {
    queryKey: [QueryType.LatestTaskVersion, id],
    queryFn: async () => {
      return fetchLatestTaskVersion(id);
    },
  };
}
