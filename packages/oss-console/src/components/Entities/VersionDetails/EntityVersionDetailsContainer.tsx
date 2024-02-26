import React, { useMemo, FC } from 'react';
import styled from '@mui/system/styled';
import { RouteComponentProps } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import PageMeta from '@clients/primitives/PageMeta';
import { LoadingSpinner } from '@clients/primitives/LoadingSpinner';
import withRouteParams from '../../common/withRouteParams';
import { ResourceIdentifier, ResourceType } from '../../../models/Common/types';
import { useProject } from '../../hooks/useProjects';
import { StaticGraphContainer } from '../../Workflow/StaticGraphContainer';
import { WorkflowId } from '../../../models/Workflow/types';
import { entitySections, typeNameToEntityResource } from '../constants';
import { EntityDetailsHeader } from '../EntityDetailsHeader';
import { EntityVersions } from '../EntityVersions';
import { versionsDetailsSections } from './constants';
import { EntityVersionDetails } from './EntityVersionDetails';

const EntityVersionsWrapper = styled(Grid, {
  shouldForwardProp: (prop) => prop !== 'resourceType',
})<{ resourceType: ResourceType }>(({ theme, resourceType }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(0, 2),
  height: `calc(100vh - ${theme.spacing(20)})` as any,
  flexWrap: 'nowrap',
  overflow: 'hidden',

  '>.MuiGrid-item': {
    overflow: 'auto',
    width: '100%',
  },
  '.staticGraphContainer': {
    height: '60vh',
    display: 'flex',
    flex: '1',
  },
  '.versionDetailsContainer': {
    height: '55vh',
    display: 'flex',
    flexDirection: 'column',

    flex: '1',
    overflowY: 'scroll',
    padding: theme.spacing(0, 2),
  },
  '.versionsContainer': {
    display: 'flex',
    flex: '0 1 auto',
    padding: theme.spacing(0, 2),
    height: resourceType === ResourceType.LAUNCH_PLAN ? '100%' : '40%',
    flexDirection: 'column',
    overflowY: 'auto',
  },
}));

export interface WorkflowVersionDetailsRouteParams {
  projectId: string;
  domainId: string;
  entityType: string;
  entityName: string;
  entityVersion: string;
}

/**
 * The view component for the Workflow Versions page
 * @param projectId
 * @param domainId
 * @param workflowName
 */
const EntityVersionsDetailsContainerImpl: FC<WorkflowVersionDetailsRouteParams> = ({
  projectId,
  domainId,
  entityType,
  entityName,
  entityVersion,
}) => {
  const workflowId = useMemo<WorkflowId>(
    () => ({
      resourceType: typeNameToEntityResource[entityType],
      project: projectId,
      domain: domainId,
      name: entityName,
      version: decodeURIComponent(entityVersion),
    }),
    [entityType, projectId, domainId, entityName, entityVersion],
  );

  const id = workflowId as ResourceIdentifier;
  const sections = entitySections[id.resourceType];
  const versionsSections = versionsDetailsSections[id.resourceType];
  const { data: project } = useProject(workflowId.project);

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

  if (!project?.id) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <PageMeta title={`${ResourceIdentifierText} Versions For ${id.name}`} />
      <Box px={0}>
        <EntityDetailsHeader id={id} launchable={sections.launch} />
      </Box>
      <EntityVersionsWrapper container direction="column" resourceType={id.resourceType}>
        {versionsSections.details && (
          <Grid item className="versionDetailsContainer">
            <EntityVersionDetails id={id} />
          </Grid>
        )}
        {versionsSections.graph && (
          <Grid item className="staticGraphContainer">
            <StaticGraphContainer workflowId={workflowId} />
          </Grid>
        )}
        <Grid item className="versionsContainer">
          <EntityVersions id={id} showAll />
        </Grid>
      </EntityVersionsWrapper>
    </>
  );
};

export const EntityVersionsDetailsContainer: FC<
  RouteComponentProps<WorkflowVersionDetailsRouteParams>
> = withRouteParams<WorkflowVersionDetailsRouteParams>(EntityVersionsDetailsContainerImpl);

export default EntityVersionsDetailsContainer;
