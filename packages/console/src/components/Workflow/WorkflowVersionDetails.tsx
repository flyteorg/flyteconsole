import * as React from 'react';
import { withRouteParams } from 'components/common/withRouteParams';
import { ResourceIdentifier, ResourceType } from 'models/Common/types';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { useProject } from 'components/hooks/useProjects';
import { StaticGraphContainer } from 'components/Workflow/StaticGraphContainer';
import { WorkflowId } from 'models/Workflow/types';
import { entitySections } from 'components/Entities/constants';
import { EntityDetailsHeader } from 'components/Entities/EntityDetailsHeader';
import { EntityVersions } from 'components/Entities/EntityVersions';
import { RouteComponentProps } from 'react-router-dom';
import { LoadingSpinner } from 'components/common';

const useStyles = makeStyles((_theme: Theme) => ({
  verionDetailsContatiner: {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'nowrap',
    overflow: 'hidden',
    height: `calc(100vh - ${_theme.spacing(1)}rem)`,
  },
  staticGraphContainer: {
    display: 'flex',
    height: '60%',
    width: '100%',
    flex: '1',
  },
  versionsContainer: {
    display: 'flex',
    flex: '0 1 auto',
    height: '40%',
    flexDirection: 'column',
    overflowY: 'scroll',
  },
}));

interface WorkflowVersionDetailsRouteParams {
  projectId: string;
  domainId: string;
  workflowName: string;
  workflowVersion: string;
}

/**
 * The view component for the Workflow Versions page
 * @param projectId
 * @param domainId
 * @param workflowName
 */
const WorkflowVersionDetailsContainer: React.FC<
  WorkflowVersionDetailsRouteParams
> = ({ projectId, domainId, workflowName, workflowVersion }) => {
  const workflowId = React.useMemo<WorkflowId>(
    () => ({
      resourceType: ResourceType.WORKFLOW,
      project: projectId,
      domain: domainId,
      name: workflowName,
      version: workflowVersion,
    }),
    [projectId, domainId, workflowName, workflowVersion],
  );

  const id = workflowId as ResourceIdentifier;
  const sections = entitySections[ResourceType.WORKFLOW];
  const [project] = useProject(workflowId.project);
  const styles = useStyles();

  if (!project?.id) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <EntityDetailsHeader
        id={id}
        launchable={sections.launch}
        backToWorkflow
        project={project}
      />
      <div className={styles.verionDetailsContatiner}>
        <div className={styles.staticGraphContainer}>
          <StaticGraphContainer workflowId={workflowId} />
        </div>
        <div className={styles.versionsContainer}>
          <EntityVersions id={id} showAll />
        </div>
      </div>
    </>
  );
};

export const WorkflowVersionDetails: React.FunctionComponent<
  RouteComponentProps<WorkflowVersionDetailsRouteParams>
> = withRouteParams<WorkflowVersionDetailsRouteParams>(
  WorkflowVersionDetailsContainer,
);
