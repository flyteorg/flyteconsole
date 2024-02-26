import React, { Suspense, lazy, useEffect } from 'react';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';
import { makeRoute } from '@clients/common/routes';
import { PageMeta } from '@clients/primitives/PageMeta';
import { useUserIdentity } from '@clients/primitives/hooks/IdentityProvider/useUserIdentity';
import { history } from '../routes/history';
import {
  getLocalStore,
  LocalStorageProjectDomain,
  LOCAL_PROJECT_DOMAIN,
} from '../components/common/LocalStoreDefaults';
import { PrettyError } from '../components/Errors/PrettyError';
import { useDomainPathUpgrade } from '../routes/useDomainPathUpgrade';
import { Routes } from '../routes/routes';
import AnimateRoute from '../routes/AnimateRoute';

const SelectProject = lazy(
  () => import(/* webpackChunkName: "SelectProject" */ '../components/SelectProject'),
);
const ListProjectEntities = lazy(
  () => import(/* webpackChunkName: "ListProjectEntities" */ '../components/ListProjectEntities'),
);

const ExecutionDetails = lazy(
  () =>
    import(/* webpackChunkName: "ExecutionDetails" */ '../components/Executions/ExecutionDetails'),
);

const TaskDetails = lazy(() => import(/* webpackChunkName: "TaskDetails" */ '../components/Task'));
const WorkflowDetails = lazy(
  () => import(/* webpackChunkName: "WorkflowDetails" */ '../components/Workflow/WorkflowDetails'),
);
const LaunchPlanDetails = lazy(
  () =>
    import(
      /* webpackChunkName: "LaunchPlanDetails" */ '../components/LaunchPlan/LaunchPlanDetails'
    ),
);
const EntityVersionsDetailsContainer = lazy(
  () =>
    import(
      /* webpackChunkName: "EntityVersionsDetailsContainer" */ '../components/Entities/VersionDetails/EntityVersionDetailsContainer'
    ),
);

export const ApplicationRouter: React.FC = () => {
  const localProjectDomain = getLocalStore(LOCAL_PROJECT_DOMAIN) as LocalStorageProjectDomain;
  const { search, pathname } = useLocation();

  useDomainPathUpgrade(localProjectDomain, pathname, search, history);

  const id = useUserIdentity();
  // @ts-ignore
  const orgId = id?.profile?.data?.additional_claims?.userhandle ?? '';

  // Temp ORG ID auth redirect fix
  // Shouldn't be invoved if working correctly
  useEffect(() => {
    const orgRegex = /^\/org\/:orgid/i;
    const brokenRedirect = orgRegex.test(pathname);
    if (brokenRedirect && !!orgId) {
      history.push(pathname.replace(orgRegex, `/org/${orgId}`));
    }
  }, [orgId, pathname]);

  return (
    <>
      <PageMeta />
      <Suspense>
        <Switch>
          <Route path={Routes.ExecutionDetails.path} component={ExecutionDetails} />
          <Route path={Routes.TaskDetails.path} component={TaskDetails} />
          <Route exact path={Routes.LaunchPlanDetails.path} component={LaunchPlanDetails} />
          <Route exact path={Routes.WorkflowDetails.path} component={WorkflowDetails} />
          <Route
            path={Routes.EntityVersionDetails.path}
            component={EntityVersionsDetailsContainer}
          />
          <Route path={Routes.ProjectDetails.path} component={ListProjectEntities} />
          <Route path={Routes.SelectProject.path} exact component={SelectProject} />
          <Route
            path={[makeRoute('/'), '/org/:orgId/console']}
            render={() => {
              /**
               * If LocalStoreDefaults exists, we direct them to the project detail view
               * for those values.
               *
               * TODO: the Routes.SelectProject.id check should be removed once we phase out the
               *       local storage bug that leads to 404
               */
              if (localProjectDomain && localProjectDomain.project !== Routes.SelectProject.id) {
                return (
                  <Redirect
                    to={`${makeRoute('/')}/projects/${localProjectDomain.project}/domains/${
                      localProjectDomain.domain
                    }`}
                  />
                );
              }

              return <Redirect to={Routes.SelectProject.path} />;
            }}
          />
          <Route component={PrettyError} />
        </Switch>
      </Suspense>
      <AnimateRoute history={history} />
    </>
  );
};

export default ApplicationRouter;
