import React, { FC } from 'react';
import { SearchableLaunchPlanNameList } from '../LaunchPlan/SearchableLaunchPlanNameList';

export interface ListProjectLaunchPlansProps {
  projectId: string;
  domainId: string;
}

/** A listing of the LaunchPlans registered for a project */
export const ListProjectLaunchPlans: FC<ListProjectLaunchPlansProps> = ({
  domainId: domain,
  projectId: project,
}) => {
  return <SearchableLaunchPlanNameList domainId={domain} projectId={project} />;
};
