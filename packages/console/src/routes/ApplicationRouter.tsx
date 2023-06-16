import {
  ContentContainer,
  ContentContainerProps,
} from 'components/common/ContentContainer';
import { withSideNavigation } from 'components/Navigation/withSideNavigation';
import React, { useState, useEffect } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { useExternalConfigurationContext } from 'basics/ExternalConfigurationProvider';
import { Toolbar } from '@material-ui/core';
import { styled } from '@material-ui/core/styles';
import { subnavBarContentId } from 'common/constants';
import { subnavBackgroundColor } from 'components/Theme/constants';
import { makeRoute } from '@flyteorg/common';
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
/**
 * The last project/domain viewed by a user is saved to localStorage
 * to bypass the project select UX if values exists
 */
export interface LocalStoreDefaults {
  project: string | null;
  domain: string | null;
}
export const LOCAL_STORE_DEFAULTS = 'localProjectDomain';

export const ApplicationRouter: React.FC = () => {
  const localProject = localStorage.getItem(LOCAL_STORE_DEFAULTS);
  let projectDomain: LocalStoreDefaults;
  if (localProject) {
    projectDomain = JSON.parse(localProject) as LocalStoreDefaults;
  }

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
           * If LocalStoreDefaults exist, we direct them to the project detail view
           * for those values.
           */
          if (projectDomain) {
            return (
              <Redirect
                to={`${makeRoute('/')}/projects/${
                  projectDomain.project
                }/executions?domain=${projectDomain.domain}&duration=all`}
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
