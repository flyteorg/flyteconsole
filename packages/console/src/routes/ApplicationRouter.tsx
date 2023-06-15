import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { history } from 'routes/history';
import { useExternalConfigurationContext } from 'basics/ExternalConfigurationProvider';
import { components } from './components';
import { Routes } from './routes';

/**
 * Perform an animation when the route changes
 * Currently only resets scroll
 * @param history
 * @returns
 */
const AnimateRoute = ({ history }) => {
  const from = React.useRef(window.location);

  const scrollToTop = () => {
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }, 0);
  };

  React.useEffect(() => {
    const historyAction = history.listen((to, action) => {
      if (action === 'PUSH') {
        // link click
        scrollToTop();
      } else if (action === 'POP' && from.current.pathname !== to.pathname) {
        // browser back button
        // only scroll to top if the path is different
        // ignore query params or hash changes
        scrollToTop();
      }
      // update from location
      from.current = to.pathname;
    });
    return () => {
      historyAction();
    };
  }, []);

  return <></>;
};

export const ApplicationRouter: React.FC = () => {
  const additionalRoutes =
    useExternalConfigurationContext()?.registry?.additionalRoutes || null;
  return (
    <>
      <Switch>
        {additionalRoutes}
        <Route
          path={Routes.ExecutionDetails.path}
          component={components.executionDetails}
        />
        <Route
          path={Routes.TaskDetails.path}
          component={components.taskDetails}
        />
        <Route
          exact
          path={Routes.LaunchPlanDetails.path}
          component={components.launchPlanDetails}
        />
        <Route
          exact
          path={Routes.WorkflowDetails.path}
          component={components.workflowDetails}
        />
        <Route
          path={Routes.EntityVersionDetails.path}
          component={components.entityVersionDetails}
        />
        <Route
          path={Routes.ProjectDetails.path}
          component={components.projectDetails}
        />
        <Route
          path={Routes.SelectProject.path}
          exact={true}
          component={components.selectProject}
        />
        <Route component={components.notFound} />
      </Switch>
      <AnimateRoute history={history} />
    </>
  );
};
