import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { AppRoute } from '@flyteconsole/components';

interface ApplicationRouterProps {
  routes: AppRoute[];
}
export const ApplicationRouter: React.FC<ApplicationRouterProps> = (
  props: ApplicationRouterProps,
) => (
  <>
    <Switch>
      {props.routes.map((route) => (
        <Route
          {...(route.path ? { path: route.path } : {})}
          {...(route.exact ? { exact: route.exact } : {})}
          component={route.component}
        />
      ))}
    </Switch>
  </>
);
