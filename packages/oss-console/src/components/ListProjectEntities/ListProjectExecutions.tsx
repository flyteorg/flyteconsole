import React, { useMemo } from 'react';
import compact from 'lodash/compact';
import Grid from '@mui/material/Grid';
import PageMeta from '@clients/primitives/PageMeta';
import { RequestConfig, SortDirection } from '@clients/common/types/adminEntityTypes';
import { DomainSettingsSection } from '../common/DomainSettingsSection';
import { getCacheKey } from '../Cache/utils';
import { ExecutionFilters } from '../Executions/ExecutionFilters';
import { useWorkflowExecutionFiltersState } from '../Executions/filters/useExecutionFiltersState';
import { WorkflowExecutionsTable } from '../Executions/Tables/WorkflowExecutionsTable';
import { executionSortFields } from '../../models/Execution/constants';
import { useExecutionShowArchivedState } from '../Executions/filters/useExecutionArchiveState';
import { useOnlyMyExecutionsFilterState } from '../Executions/filters/useOnlyMyExecutionsFilterState';
import { ExecutionsBarChartSection } from '../common/ExecutionsBarChartSection';
import { BarChartData } from '../common/BarChart';
import { useChartState } from '../hooks/useChartState';

export interface ProjectDashboardProps {
  projectId: string;
  domainId: string;
}

const DEFAULT_SORT = {
  key: executionSortFields.createdAt,
  direction: SortDirection.DESCENDING,
};

const EXECUTIONS_LIMIT = 100;

const REQUEST_CONFIG = {
  sort: DEFAULT_SORT,
  limit: EXECUTIONS_LIMIT,
};

export const ListProjectExecutions: React.FC<ProjectDashboardProps> = ({
  domainId: domain,
  projectId: project,
}) => {
  const { chartIds, onToggle, clearCharts } = useChartState();

  const archivedFilter = useExecutionShowArchivedState();
  const filtersState = useWorkflowExecutionFiltersState();
  const onlyMyExecutionsFilterState = useOnlyMyExecutionsFilterState({});

  const allFilters = compact([
    ...filtersState.appliedFilters,
    archivedFilter.getFilter(),
    onlyMyExecutionsFilterState.getFilter(),
  ]);

  const requestConfig: RequestConfig = useMemo(
    () => ({
      ...REQUEST_CONFIG,
      filter: allFilters,
    }),
    [allFilters],
  );

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

  const handleBarChartItemClick = React.useCallback((item: BarChartData) => {
    onToggle(item.metadata.name);
  }, []);

  return (
    <>
      <PageMeta title={`Executions in ${project} ${domain}`} />

      <Grid container direction="column" spacing={1}>
        {/*
             DOMAIN SETTINGS SECTION
         */}
        <Grid item xs={12}>
          <DomainSettingsSection domain={domain} project={project} />
        </Grid>
        {/*
             LAST 100 EXECUTIONS SECTION
         */}
        <Grid item xs={12}>
          <ExecutionsBarChartSection
            domain={domain}
            project={project}
            chartIds={chartIds}
            onToggle={handleBarChartItemClick}
            requestConfig={requestConfig}
          />
        </Grid>
        {/*
             EXECUTIONS FILTERS SECTION
         */}
        <Grid item xs={12}>
          <ExecutionFilters
            {...filtersState}
            showArchived={archivedFilter.showArchived}
            onArchiveFilterChange={archivedFilter.setShowArchived}
            onlyMyExecutionsFilterState={onlyMyExecutionsFilterState}
            chartIds={chartIds}
            clearCharts={clearCharts}
          />
        </Grid>
      </Grid>

      {/*
          EXECUTIONS TABLE SECTION
      */}
      <Grid container>
        <Grid item xs={12}>
          <WorkflowExecutionsTable
            showWorkflowName
            domain={domain}
            project={project}
            requestConfig={requestConfig}
            chartIds={chartIds}
            key={tableKey}
            data-testid="workflow-table"
          />
        </Grid>
      </Grid>
    </>
  );
};
