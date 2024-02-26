import React, { useMemo } from 'react';
import { SortDirection } from '@clients/common/types/adminEntityTypes';
import { SearchableTaskNameList } from '../Task/SearchableTaskNameList';
import { useTaskShowArchivedState } from '../Task/useTaskShowArchivedState';
import { limits } from '../../models/AdminEntity/constants';
import { taskSortFields } from '../../models/Task/constants';
import { useConditionalQuery } from '../hooks/useConditionalQuery';
import { NamedEntity, ResourceType } from '../../models/Common/types';
import { makeListTaskEntitiesQuery } from '../../queries/taskQueries';

export interface ListProjectTasksProps {
  projectId: string;
  domainId: string;
}

const DEFAULT_SORT = {
  direction: SortDirection.ASCENDING,
  key: taskSortFields.name,
};

/** A listing of the Tasks registered for a project */
export const ListProjectTasks: React.FC<ListProjectTasksProps> = ({
  domainId: domain,
  projectId: project,
}) => {
  const archivedFilter = useTaskShowArchivedState();

  const taskEntitiesQuery = useConditionalQuery(
    {
      ...makeListTaskEntitiesQuery(
        { domain, project, resourceType: ResourceType.WORKFLOW },
        {
          limit: limits.NONE,
          sort: DEFAULT_SORT,
          filter: [archivedFilter.getFilter()],
        },
      ),
    },
    (prev) => !prev,
  );
  const { taskEntities, loading } = useMemo(() => {
    return {
      taskEntities: (taskEntitiesQuery.data?.entities || []) as NamedEntity[],
      loading: taskEntitiesQuery.isLoading,
    };
  }, [taskEntitiesQuery]);

  return (
    <SearchableTaskNameList
      loading={loading}
      names={taskEntities}
      showArchived={archivedFilter.showArchived}
      onArchiveFilterChange={archivedFilter.setShowArchived}
    />
  );
};
