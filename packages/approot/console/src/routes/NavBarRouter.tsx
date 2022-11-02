import { NavBar } from 'components/Navigation/NavBar';
import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { AppRoute } from '@flyteconsole/components';

export const CustomNavBar = () => <NavBar useCustomContent={true} />;

interface NavBarRouterProps {
  routes: AppRoute[];
}
/** Handles the routing for content displayed in the NavBar */
export const NavBarRouter: React.FC<NavBarRouterProps> = (props: NavBarRouterProps) => (
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
