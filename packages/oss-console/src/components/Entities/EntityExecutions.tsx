import React, { useMemo } from 'react';
import Grid from '@mui/material/Grid';
import { RequestConfig } from '@clients/common/types/adminEntityTypes';
import { ExecutionFilters, OnlyMyExecutionsFilterState } from '../Executions/ExecutionFilters';
import { useWorkflowExecutionFiltersState } from '../Executions/filters/useExecutionFiltersState';
import { WorkflowExecutionsTable } from '../Executions/Tables/WorkflowExecutionsTable';
import { ResourceIdentifier } from '../../models/Common/types';
import { getCacheKey } from '../Cache/utils';
import { ArchiveFilterState } from '../Executions/filters/useExecutionArchiveState';

export interface EntityExecutionsProps {
  id: ResourceIdentifier;
  chartIds: string[];
  requestConfig: RequestConfig;
  clearCharts: () => void;
  onlyMyExecutionsFilterState?: OnlyMyExecutionsFilterState;
  archiveFilterState?: ArchiveFilterState;
}

/** The tab/page content for viewing a workflow's executions */
export const EntityExecutions: React.FC<EntityExecutionsProps> = ({
  id,
  chartIds,
  clearCharts,
  requestConfig,
  onlyMyExecutionsFilterState,
  archiveFilterState,
}) => {
  const { domain, project } = id;
  const filtersState = useWorkflowExecutionFiltersState();

  // Remount the table whenever we change project/domain/filters to ensure
  // things are virtualized correctly.
  const tableKey = useMemo(
    () =>
      getCacheKey({
        domain,
        project,
        requestConfig,
      }),
    [domain, project, requestConfig],
  );

  return (
    <Grid container>
      <Grid item xs={12}>
        <ExecutionFilters
          {...filtersState}
          chartIds={chartIds}
          clearCharts={clearCharts}
          showArchived={archiveFilterState?.showArchived}
          onArchiveFilterChange={archiveFilterState?.setShowArchived}
          onlyMyExecutionsFilterState={onlyMyExecutionsFilterState}
        />
      </Grid>
      <Grid item xs={12}>
        <WorkflowExecutionsTable
          id={id}
          domain={domain}
          project={project}
          requestConfig={requestConfig}
          chartIds={chartIds}
          key={tableKey}
          data-testid="entity-table"
        />
      </Grid>
    </Grid>
  );
};
