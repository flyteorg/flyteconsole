import * as React from 'react';
import { AppRoute, env, Routes } from '@flyteconsole/components';
import { ApplicationRouter } from 'routes/ApplicationRouter';
import { CustomNavBar, NavBarRouter } from 'routes/NavBarRouter';
import { withSideNavigation } from 'components/Navigation/withSideNavigation';
import { ContentContainer, ContentContainerProps } from 'components/common/ContentContainer';
import { NavBar } from 'components/Navigation/NavBar';
import { components } from './components';

function withContentContainer<P>(
  WrappedComponent: React.ComponentType<P>,
  contentContainerProps?: ContentContainerProps,
) {
  return (props: P) => (
    <ContentContainer center={true} {...contentContainerProps}>
      <WrappedComponent {...props} />
    </ContentContainer>
  );
}

interface AppComponentProps {
  registry: {
    customNavbar: {};
  };
}
export const AppFrame: React.FC<AppComponentProps> = (props: AppComponentProps) => {
  const navBarRoutes: AppRoute[] = [
    {
      path: Routes.ExecutionDetails.path,
      component: CustomNavBar,
    },
    {
      component: props.registry.customNavbar ? props.registry.customNavbar : NavBar,
    },
  ];

  const appContentRoutes: AppRoute[] = [
    {
      path: Routes.ExecutionDetails.path,
      component: withContentContainer(components.executionDetails, {
        center: false,
        noMargin: true,
      }),
    },
    {
      path: Routes.TaskDetails.path,
      component: withSideNavigation(components.taskDetails),
    },
    {
      path: Routes.LaunchPlanDetails.path,
      component: withSideNavigation(components.launchPlanDetails),
    },
    {
      path: Routes.WorkflowDetails.path,
      component: withSideNavigation(components.workflowDetails),
    },
    {
      path: Routes.EntityVersionDetails.path,
      component: withSideNavigation(components.entityVersionDetails),
    },
    {
      path: Routes.ProjectDetails.path,
      component: withSideNavigation(components.projectDetails, {
        noMargin: true,
      }),
    },
    {
      path: Routes.SelectProject.path,
      exact: true,
      component: withContentContainer(components.selectProject),
    },
    {
      component: withContentContainer(components.notFound),
    },
  ];

  return (
    <>
      <NavBarRouter routes={navBarRoutes} />
      <ApplicationRouter routes={appContentRoutes} />
    </>
  );
};
