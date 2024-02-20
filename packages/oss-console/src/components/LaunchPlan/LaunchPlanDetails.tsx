import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import withRouteParams from '../common/withRouteParams';
import { EntityDetails } from '../Entities/EntityDetails';
import { ResourceIdentifier, ResourceType } from '../../models/Common/types';

export interface LaunchPlanDetailsRouteParams {
  projectId: string;
  domainId: string;
  launchPlanName: string;
}
export type LaunchPlanDetailsProps = LaunchPlanDetailsRouteParams;

/** The view component for the LaunchPlan landing page */
export const LaunchPlanDetailsContainer: React.FC<LaunchPlanDetailsRouteParams> = ({
  projectId,
  domainId,
  launchPlanName,
}) => {
  const id = React.useMemo<ResourceIdentifier>(
    () => ({
      resourceType: ResourceType.LAUNCH_PLAN,
      project: projectId,
      domain: domainId,
      name: launchPlanName,
    }),
    [projectId, domainId, launchPlanName],
  );
  return <EntityDetails id={id} />;
};

export const LaunchPlanDetails: React.FunctionComponent<
  RouteComponentProps<LaunchPlanDetailsRouteParams>
> = withRouteParams<LaunchPlanDetailsRouteParams>(LaunchPlanDetailsContainer);

export default LaunchPlanDetails;
