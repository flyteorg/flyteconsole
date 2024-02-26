import React, { useMemo } from 'react';
import { SortDirection } from '@clients/common/types/adminEntityTypes';
import { useWorkflowShowArchivedState } from '../Workflow/filters/useWorkflowShowArchivedState';
import { SearchableWorkflowNameList } from '../Workflow/SearchableWorkflowNameList';
import { limits } from '../../models/AdminEntity/constants';
import { workflowSortFields } from '../../models/Workflow/constants';
import { useConditionalQuery } from '../hooks/useConditionalQuery';
import { NamedEntity, ResourceType } from '../../models/Common/types';
import { makeListWorkflowEntitiesQuery } from '../../queries/workflowQueries';

export interface ListProjectWorkflowsProps {
  projectId: string;
  domainId: string;
}

const DEFAULT_SORT = {
  direction: SortDirection.ASCENDING,
  key: workflowSortFields.name,
};

/** A listing of the Workflows registered for a project */
export const ListProjectWorkflows: React.FC<ListProjectWorkflowsProps> = ({
  domainId: domain,
  projectId: project,
}) => {
  const archivedFilter = useWorkflowShowArchivedState();

  const workflowEntitiesQuery = useConditionalQuery(
    {
      ...makeListWorkflowEntitiesQuery(
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

  const { workflowEntities, loading } = useMemo(() => {
    return {
      workflowEntities: (workflowEntitiesQuery.data?.entities || []) as NamedEntity[],
      loading: workflowEntitiesQuery.isLoading,
    };
  }, [workflowEntitiesQuery]);

  return (
    <SearchableWorkflowNameList
      names={workflowEntities}
      showArchived={archivedFilter.showArchived}
      onArchiveFilterChange={archivedFilter.setShowArchived}
      loading={loading}
    />
  );
};
