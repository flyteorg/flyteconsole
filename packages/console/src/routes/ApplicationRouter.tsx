import {
  ContentContainer,
  ContentContainerProps,
} from 'components/common/ContentContainer';
import { withSideNavigation } from 'components/Navigation/withSideNavigation';
import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { useExternalConfigurationContext } from 'basics/ExternalConfigurationProvider';
import { Toolbar } from '@material-ui/core';
import { styled } from '@material-ui/core/styles';
import { subnavBarContentId } from 'common/constants';
import { subnavBackgroundColor } from 'components/Theme/constants';
import { makeRoute } from '@flyteorg/common';
import {
  getLocalStore,
  LocalStorageProjectDomain,
  LOCAL_PROJECT_DOMAIN,
} from 'components/common/LocalStoreDefaults';
import { components } from './components';
import { Routes } from './routes';

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
  const localProjectDomain = getLocalStore(
    LOCAL_PROJECT_DOMAIN,
  ) as LocalStorageProjectDomain;

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
          /**
           * If LocalStoreDefaults exists, we direct them to the project detail view
           * for those values.
           *
           * TODO: the Routes.SelectProject.id check should be removed once we phase out the
           *       local storage bug that leads to 404
           */
          if (
            localProjectDomain &&
            localProjectDomain.project !== Routes.SelectProject.id
          ) {
            return (
              <Redirect
                to={`${makeRoute('/')}/projects/${
                  localProjectDomain.project
                }/executions?domain=${localProjectDomain.domain}&duration=all`}
              />
            );
          } else {
            return <Redirect to={Routes.SelectProject.path} />;
          }
        }}
      />
      <Route component={withContentContainer(components.notFound)} />
    </Switch>
  );
};
