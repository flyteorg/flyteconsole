import {
  ContentContainer,
  ContentContainerProps,
} from 'components/common/ContentContainer';
import { withSideNavigation } from 'components/Navigation/withSideNavigation';
import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { useExternalConfigurationContext } from 'basics/ExternalConfigurationProvider';
import { Toolbar } from '@material-ui/core';
import { styled } from '@material-ui/core/styles';
import { subnavBarContentId } from 'common/constants';
import { subnavBackgroundColor } from 'components/Theme/constants';
import { makeRoute } from '@flyteorg/common';
import { components } from './components';
import { makeProjectBoundPath, Routes } from './routes';

const StyledSubNavBarContent = styled(Toolbar)(() => ({
  minHeight: 'auto',
  padding: 0,
  margin: 0,

  '& > *': {
    alignItems: 'center',
    display: 'flex',
    maxWidth: '100%',
    padding: '24px 20px 24px 30px',
    background: subnavBackgroundColor,
  },
  '@media (min-width: 600px)': {
    minHeight: 'auto',
  },
}));

export function withContentContainer<P extends {}>(
  WrappedComponent: React.FC<P>,
  contentContainerProps?: ContentContainerProps,
) {
  return (props: P) => (
    <ContentContainer center={true} {...contentContainerProps}>
      <StyledSubNavBarContent
        className="subnav"
        id={subnavBarContentId}
      ></StyledSubNavBarContent>

      <WrappedComponent {...props} />
    </ContentContainer>
  );
}

export const ApplicationRouter: React.FC = () => {
  const additionalRoutes =
    useExternalConfigurationContext()?.registry?.additionalRoutes || null;
  return (
    <Switch>
      {additionalRoutes}
      <Route
        path={Routes.ExecutionDetails.path}
        component={withContentContainer(components.executionDetails, {
          center: false,
          noMargin: true,
        })}
      />
      <Route
        path={Routes.TaskDetails.path}
        component={withSideNavigation(components.taskDetails)}
      />
      <Route
        exact
        path={Routes.LaunchPlanDetails.path}
        component={withSideNavigation(components.launchPlanDetails)}
      />
      <Route
        exact
        path={Routes.WorkflowDetails.path}
        component={withSideNavigation(components.workflowDetails)}
      />
      <Route
        path={Routes.EntityVersionDetails.path}
        component={withSideNavigation(components.entityVersionDetails)}
      />
      <Route
        path={Routes.ProjectDetails.path}
        component={withSideNavigation(components.projectDetails, {
          noMargin: true,
        })}
      />
      <Route
        path={Routes.SelectProject.path}
        exact={true}
        component={withContentContainer(components.selectProject)}
      />
      <Route
        path={makeRoute('/')}
        render={() => {
          // check if value exists in local storage
          const localStoreProject = 'onboarding';
          const localStoreDomain = 'development';
          if (localStoreProject && localStoreDomain) {
            return (
              <Redirect
                to={`${makeRoute(
                  '/',
                )}/projects/${localStoreProject}/executions?domain=${localStoreDomain}&duration=all`}
              />
            );
          } else {
            return <Redirect to={makeRoute('/select')} />;
          }
        }}
      />
      <Route component={withContentContainer(components.notFound)} />
    </Switch>
  );
};
