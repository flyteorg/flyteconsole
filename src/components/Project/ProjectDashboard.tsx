import { makeStyles, Theme } from '@material-ui/core/styles';
import * as React from 'react';
import { Typography } from '@material-ui/core';
import { useTaskNameList, useWorkflowNameList } from 'components/hooks/useNamedEntity';
import { useWorkflowExecutions } from 'components/hooks/useWorkflowExecutions';
import { WaitForQuery } from 'components/common/WaitForQuery';
import { useInfiniteQuery, useQuery, useQueryClient } from 'react-query';
import { Admin } from 'flyteidl';
import { DomainSettingsSection } from 'components/common/DomainSettingsSection';
import { getCacheKey } from 'components/Cache/utils';
import { ErrorBoundary } from 'components/common/ErrorBoundary';
import { LargeLoadingSpinner } from 'components/common/LoadingSpinner';
import { DataError } from 'components/Errors/DataError';
import { ExecutionFilters } from 'components/Executions/ExecutionFilters';
import { useWorkflowExecutionFiltersState } from 'components/Executions/filters/useExecutionFiltersState';
import { WorkflowExecutionsTable } from 'components/Executions/Tables/WorkflowExecutionsTable';
import { makeWorkflowExecutionListQuery } from 'components/Executions/workflowExecutionQueries';
import { SortDirection } from 'models/AdminEntity/types';
import { executionSortFields } from 'models/Execution/constants';
import { Execution } from 'models/Execution/types';
import { BarChart } from 'components/common/BarChart';
import {
  getExecutionTimeData,
  getStartExecutionTime,
} from 'components/Entities/EntityExecutionsBarChart';
import classNames from 'classnames';
import { useExecutionShowArchivedState } from 'components/Executions/filters/useExecutionArchiveState';
import { useOnlyMyExecutionsFilterState } from 'components/Executions/filters/useOnlyMyExecutionsFilterState';
import { WaitForData } from 'components/common/WaitForData';
import { history } from 'routes/history';
import { Routes } from 'routes/routes';
import { compact } from 'lodash';
import { getProjectDomainAttributes } from 'models/Project/api';
import t from './strings';
import { failedToLoadExecutionsString } from './constants';

const useStyles = makeStyles((theme: Theme) => ({
  projectStats: {
    paddingTop: theme.spacing(7),
    paddingBottom: theme.spacing(7),
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  container: {
    display: 'flex',
    flex: '1 1 auto',
    flexDirection: 'column',
  },
  header: {
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  marginTop: {
    marginTop: theme.spacing(2),
  },
  chartContainer: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(3),
    paddingTop: theme.spacing(1),
  },
}));

export interface ProjectDashboardProps {
  projectId: string;
  domainId: string;
}

const defaultSort = {
  key: executionSortFields.createdAt,
  direction: SortDirection.DESCENDING,
};

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  domainId: domain,
  projectId: project,
}) => {
  const styles = useStyles();
  const archivedFilter = useExecutionShowArchivedState();
  const filtersState = useWorkflowExecutionFiltersState();
  const onlyMyExecutionsFilterState = useOnlyMyExecutionsFilterState({});

  const allFilters = compact([
    ...filtersState.appliedFilters,
    archivedFilter.getFilter(),
    onlyMyExecutionsFilterState.getFilter(),
  ]);
  const config = {
    sort: defaultSort,
    filter: allFilters,
  };

  // Remount the table whenever we change project/domain/filters to ensure
  // things are virtualized correctly.
  const tableKey = React.useMemo(
    () =>
      getCacheKey({
        domain,
        project,
        filters: allFilters,
      }),
    [domain, project, allFilters],
  );

  const executionsQuery = useInfiniteQuery({
    ...makeWorkflowExecutionListQuery({ domain, project }, config),
  });

  // useInfiniteQuery returns pages of items, but the table would like a single
  // flat list.
  const executions = React.useMemo(
    () =>
      executionsQuery.data?.pages
        ? executionsQuery.data.pages.reduce<Execution[]>((acc, { data }) => acc.concat(data), [])
        : [],
    [executionsQuery.data?.pages],
  );

  const handleBarChartItemClick = React.useCallback((item) => {
    history.push(Routes.ExecutionDetails.makeUrl(item.metadata));
  }, []);

  // to show only in bar chart view
  const last100Executions = useWorkflowExecutions(
    { domain, project },
    {
      sort: defaultSort,
      filter: allFilters,
      limit: 100,
    },
  );

  const fetch = React.useCallback(() => executionsQuery.fetchNextPage(), [executionsQuery]);

  const { value: workflows } = useWorkflowNameList({ domain, project }, {});
  const numberOfWorkflows = workflows.length;
  const { value: tasks } = useTaskNameList({ domain, project }, {});
  const numberOfTasks = tasks.length;

  const queryClient = useQueryClient();

  const projectDomainAttributesQuery = useQuery<Admin.ProjectDomainAttributesGetResponse, Error>({
    queryKey: ['projectDomainAttributes', project, domain],
    queryFn: async () => {
      const projectDomainAtributes = await getProjectDomainAttributes({ domain, project });
      queryClient.setQueryData(
        ['projectDomainAttributes', project, domain],
        projectDomainAtributes,
      );
      return projectDomainAtributes;
    },
    staleTime: Infinity,
  });

  const content = executionsQuery.isLoadingError ? (
    <DataError
      error={executionsQuery.error}
      errorTitle={failedToLoadExecutionsString}
      retry={fetch}
    />
  ) : executionsQuery.isLoading ? (
    <LargeLoadingSpinner />
  ) : (
    <WorkflowExecutionsTable
      key={tableKey}
      fetch={fetch}
      value={executions}
      lastError={executionsQuery.error}
      moreItemsAvailable={!!executionsQuery.hasNextPage}
      showWorkflowName={true}
      isFetching={executionsQuery.isFetching}
      data-testid="workflow-table"
    />
  );

  const configData =
    projectDomainAttributesQuery.data?.attributes?.matchingAttributes?.workflowExecutionConfig ??
    undefined;

  const renderDomainSettingsSection = () => (
    <div>
      <div className={styles.projectStats}>
        <Typography variant="h5">{t('workflowsTotal', numberOfWorkflows)}</Typography>
        <Typography variant="h5">{t('tasksTotal', numberOfTasks)}</Typography>
      </div>
      <DomainSettingsSection configData={configData} />{' '}
    </div>
  );

  return (
    <div className={styles.container}>
      <WaitForQuery query={projectDomainAttributesQuery}>
        {renderDomainSettingsSection}
      </WaitForQuery>
      <div className={styles.container}>
        <Typography className={classNames(styles.header, styles.marginTop)} variant="h6">
          {t('last100ExecutionsTitle')}
        </Typography>
        <div className={styles.chartContainer}>
          <WaitForData {...last100Executions}>
            <BarChart
              chartIds={[]}
              data={getExecutionTimeData(last100Executions.value)}
              startDate={getStartExecutionTime(last100Executions.value)}
              onClickItem={handleBarChartItemClick}
            />
          </WaitForData>
        </div>
        <Typography className={styles.header} variant="h6">
          {t('allExecutionsTitle')}
        </Typography>
        <ExecutionFilters
          {...filtersState}
          showArchived={archivedFilter.showArchived}
          onArchiveFilterChange={archivedFilter.setShowArchived}
          onlyMyExecutionsFilterState={onlyMyExecutionsFilterState}
        />
        <ErrorBoundary>{content}</ErrorBoundary>
      </div>
    </div>
  );
};
