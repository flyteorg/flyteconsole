import React, { useMemo } from 'react';
import styled from '@mui/system/styled';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import compact from 'lodash/compact';

import PageMeta from '@clients/primitives/PageMeta';
import { LoadingSpinner } from '@clients/primitives/LoadingSpinner';
import { RequestConfig, SortDirection } from '@clients/common/types/adminEntityTypes';
import { EntityDescription } from './EntityDescription';
import { useProject } from '../hooks/useProjects';
import { useChartState } from '../hooks/useChartState';
import { ResourceIdentifier, ResourceType } from '../../models/Common/types';
import { ExecutionsBarChartSection } from '../common/ExecutionsBarChartSection';
import { useExecutionShowArchivedState } from '../Executions/filters/useExecutionArchiveState';
import { useWorkflowExecutionFiltersState } from '../Executions/filters/useExecutionFiltersState';
import { useOnlyMyExecutionsFilterState } from '../Executions/filters/useOnlyMyExecutionsFilterState';
import { BarChartData } from '../common/BarChart';
import { entitySections } from './constants';
import { EntityDetailsHeader } from './EntityDetailsHeader';
import { EntityInputs } from './EntityInputs';
import { EntityExecutions } from './EntityExecutions';
import { EntityVersions } from './EntityVersions';
import { executionFilterGenerator } from './generators';
import { executionSortFields } from '../../models/Execution/constants';
import { EntitySchedules } from './EntitySchedules';

const EntityDetailsContainer = styled(Grid)(({ theme }) => ({
  minHeight: '100vh',
  '.ui-section': {
    padding: theme.spacing(2),
  },
  '& .last-100-executions-section': {
    padding: 0,
  },
}));

interface EntityDetailsProps {
  id: ResourceIdentifier;
}

const EXECUTIONS_LIMIT = 100;

const DEFAULT_SORT = {
  key: executionSortFields.createdAt,
  direction: SortDirection.DESCENDING,
};

export const REQUEST_CONFIG = {
  sort: DEFAULT_SORT,
  limit: EXECUTIONS_LIMIT,
};

/**
 * A view which optionally renders description, schedules, executions, and a
 * launch button/form for a given entity. Note: not all components are suitable
 * for use with all entities (not all entities have schedules, for example).
 * @param id
 */
export const EntityDetails: React.FC<EntityDetailsProps> = ({ id }) => {
  const sections = entitySections[id.resourceType];
  const { data: project } = useProject(id.project);
  const { chartIds, onToggle, clearCharts } = useChartState();

  const baseFilters = useMemo(
    () => executionFilterGenerator[id.resourceType](id),
    [id, id.resourceType],
  );

  const filtersState = useWorkflowExecutionFiltersState();
  const archivedFilter = useExecutionShowArchivedState();
  const onlyMyExecutionsFilterState = useOnlyMyExecutionsFilterState({});

  const allFilters = compact([
    ...baseFilters,
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

  const ResourceIdentifierText = useMemo(() => {
    switch (id.resourceType) {
      case ResourceType.TASK:
        return 'Task';
      case ResourceType.WORKFLOW:
        return 'Workflow';
      case ResourceType.LAUNCH_PLAN:
        return 'Launch Plan';
      default:
        return 'Entity';
    }
  }, [id.resourceType]);

  const headerText = `All executions in the ${ResourceIdentifierText}`;

  const handleBarChartItemClick = React.useCallback((item: BarChartData) => {
    onToggle(item.metadata.name);
  }, []);

  return (
    <>
      <PageMeta title={`${ResourceIdentifierText} Details For ${id.name}`} />
      <EntityDetailsContainer container direction="column">
        {!project?.id && <LoadingSpinner />}
        {project?.id && (
          <Grid item xs={12}>
            {/* Portal into breadcrumbs */}
            <Box px={0}>
              <EntityDetailsHeader id={id} launchable={!!sections.launch} />
            </Box>
            <Grid
              container
              spacing={1}
              sx={{
                paddingLeft: (theme) => theme.spacing(2),
                paddingRight: (theme) => theme.spacing(2),
              }}
            >
              {!!sections.description && (
                <Grid item xs={12}>
                  <EntityDescription id={id} />
                </Grid>
              )}

              {!!sections.schedules && (
                <Grid item xs={12}>
                  <EntitySchedules id={id} />
                </Grid>
              )}

              {!!sections.inputs && (
                <Grid item xs={12}>
                  <EntityInputs id={id} />
                </Grid>
              )}

              {!!sections.versions && (
                <Grid item xs={12}>
                  <EntityVersions id={id} />
                </Grid>
              )}

              <Grid item xs={12}>
                <ExecutionsBarChartSection
                  resourceType={ResourceIdentifierText}
                  domain={id.domain}
                  project={id.project}
                  headerText={headerText}
                  onToggle={handleBarChartItemClick}
                  chartIds={chartIds}
                  requestConfig={requestConfig}
                />
                <Box pt={0.25} />
              </Grid>
            </Grid>
            <Grid container>
              <Grid item xs={12}>
                {sections.executions ? (
                  <EntityExecutions
                    chartIds={chartIds}
                    id={id}
                    clearCharts={clearCharts}
                    requestConfig={requestConfig}
                    onlyMyExecutionsFilterState={onlyMyExecutionsFilterState}
                    archiveFilterState={archivedFilter}
                  />
                ) : (
                  <LoadingSpinner />
                )}
              </Grid>
            </Grid>
          </Grid>
        )}
      </EntityDetailsContainer>
    </>
  );
};
