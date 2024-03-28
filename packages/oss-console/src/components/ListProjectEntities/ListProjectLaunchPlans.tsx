import React, { FC } from 'react';
import { LaunchPlanList } from '../LaunchPlan/LaunchPlanList';

export interface ListProjectLaunchPlansProps {
  projectId: string;
  domainId: string;
}

/** A listing of the LaunchPlans registered for a project */
export const ListProjectLaunchPlans: FC<ListProjectLaunchPlansProps> = ({
  domainId: domain,
  projectId: project,
}) => {
  return <LaunchPlanList domainId={domain} projectId={project} />;
};
