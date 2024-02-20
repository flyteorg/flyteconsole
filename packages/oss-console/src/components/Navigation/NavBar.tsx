import React from 'react';
import { FlyteNavigation } from '@clients/theme/config';
import ExecutionsLogo from '@clients/ui-atoms/ExecutionsLogo';
import LaunchPlansLogo from '@clients/ui-atoms/LaunchPlansLogo';
import TasksLogo from '@clients/ui-atoms/TasksLogo';
import WorkflowsLogo from '@clients/ui-atoms/WorkflowsLogo';
import {
  NavItem,
  arePathsActive,
  defaultNavigationItems,
} from '@clients/primitives/utils/navUtils';
import { CustomNavBar } from '@clients/primitives/CustomNavBar';
import { Routes } from '../../routes/routes';
import { LOCAL_PROJECT_DOMAIN, getLocalStore } from '../common/LocalStoreDefaults';

import { useTopLevelLayoutContext } from '../common/TopLevelLayout/TopLevelLayoutState';

export interface NavBarProps {
  useCustomContent?: boolean;
  navigationData?: FlyteNavigation;
}

const getStoreDefaults = () => {
  const storeDefaults = getLocalStore()?.[LOCAL_PROJECT_DOMAIN];
  return {
    domainId: storeDefaults?.domain,
    projectId: storeDefaults?.project,
  };
};

// TODO: move to primitives
const consoleNavigationItems: NavItem[] = [
  {
    id: 'executions',
    label: 'Executions',
    icon: <ExecutionsLogo />,
    getMatchDetails: () => {
      const storeDefaults = getStoreDefaults();
      const a = arePathsActive(
        storeDefaults,
        Routes.ProjectDashboard.path,
        Routes.ProjectDetails.sections.dashboard.path,
      );
      return a;
    },
    getUrl: (projectId: string, domainId: string) =>
      Routes.ProjectDetails.sections.dashboard.makeUrl(projectId, domainId),
  },
  {
    id: 'workflows',
    label: 'Workflows',
    icon: <WorkflowsLogo />,
    getMatchDetails: () => {
      const storeDefaults = getStoreDefaults();
      return arePathsActive(
        storeDefaults,
        Routes.WorkflowDetails.path,
        Routes.WorkflowVersionDetails.path,
        Routes.ProjectDetails.sections.workflows.path,
      );
    },
    getUrl: (projectId: string, domainId: string) =>
      Routes.ProjectDetails.sections.workflows.makeUrl(projectId, domainId),
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: <TasksLogo />,
    getMatchDetails: () => {
      const storeDefaults = getStoreDefaults();
      return arePathsActive(
        storeDefaults,
        Routes.TaskDetails.path,
        Routes.TaskVersionDetails.path,
        Routes.ProjectDetails.sections.tasks.path,
      );
    },
    getUrl: (projectId: string, domainId: string) =>
      Routes.ProjectDetails.sections.tasks.makeUrl(projectId, domainId),
  },
  {
    id: 'launch_plans',
    label: 'Launch Plans',
    icon: <LaunchPlansLogo />,
    getMatchDetails: () => {
      const storeDefaults = getStoreDefaults();
      return arePathsActive(
        storeDefaults,
        Routes.LaunchPlanDetails.path,
        Routes.LaunchPlanVersionDetails.path,
        Routes.ProjectDetails.sections.launchPlans.path,
      );
    },
    getUrl: (projectId: string, domainId: string) =>
      Routes.ProjectDetails.sections.launchPlans.makeUrl(projectId, domainId),
  },
];

/** Contains all content in the top navbar of the application. */
export const NavBar = (props: NavBarProps) => {
  const layoutState = useTopLevelLayoutContext();

  return (
    <CustomNavBar
      {...props}
      {...layoutState}
      navigationItems={[...defaultNavigationItems, ...consoleNavigationItems]}
    />
  );
};

export default NavBar;
