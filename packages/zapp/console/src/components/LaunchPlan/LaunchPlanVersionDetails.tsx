import * as React from 'react';
import { withRouteParams } from 'components/common/withRouteParams';
import { ResourceIdentifier, ResourceType } from 'models/Common/types';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { WaitForData } from 'components/common/WaitForData';
import { useProject } from 'components/hooks/useProjects';
import { LaunchPlanId } from 'models/Launch/types';
import { entitySections } from 'components/Entities/constants';
import { EntityDetailsHeader } from 'components/Entities/EntityDetailsHeader';
import { EntityVersions } from 'components/Entities/EntityVersions';

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

interface LaunchPlanVersionDetailsRouteParams {
  projectId: string;
  domainId: string;
  launchPlanName: string;
  launchPlanVersion: string;
}

/**
 * The view component for the LaunchPlan Versions page
 * @param projectId
 * @param domainId
 * @param launchPlanName
 */
const LaunchPlanVersionDetailsContainer: React.FC<LaunchPlanVersionDetailsRouteParams> = ({
  projectId,
  domainId,
  launchPlanName,
  launchPlanVersion,
}) => {
  const launchPlanId = React.useMemo<LaunchPlanId>(
    () => ({
      resourceType: ResourceType.LAUNCH_PLAN,
      project: projectId,
      domain: domainId,
      name: launchPlanName,
      version: launchPlanVersion,
    }),
    [projectId, domainId, launchPlanName, launchPlanVersion],
  );

  const id = launchPlanId as ResourceIdentifier;
  const sections = entitySections[ResourceType.LAUNCH_PLAN];
  const project = useProject(launchPlanId.project);
  const styles = useStyles();

  return (
    <WaitForData {...project}>
      <EntityDetailsHeader
        project={project.value}
        id={id}
        launchable={sections.launch}
        backToWorkflow
      />
      <div className={styles.verionDetailsContatiner}>
        <div className={styles.versionsContainer}>
          <EntityVersions id={id} showAll />
        </div>
      </div>
    </WaitForData>
  );
};

export const LaunchPlanVersionDetails = withRouteParams<LaunchPlanVersionDetailsRouteParams>(
  LaunchPlanVersionDetailsContainer,
);
