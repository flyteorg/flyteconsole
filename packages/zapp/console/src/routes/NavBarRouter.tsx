import { NavBar } from 'components/Navigation/NavBar';
import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { Routes } from './routes';

const CustomNavBar = () => <NavBar useCustomContent={true} />;

/** Handles the routing for content displayed in the NavBar */
export const NavBarRouter: React.FC<{}> = () => (
  <>
    <Switch>
      <Route path={Routes.ExecutionDetails.path} component={CustomNavBar} />
      <Route component={NavBar} />
    </Switch>
  </>
);
