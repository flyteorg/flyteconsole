import { NavBar } from 'components/Navigation/NavBar';
import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { useExternalConfigurationContext } from 'basics/ExternalConfigurationProvider';
import { Routes } from './routes';

const CustomNavBar = () => <NavBar useCustomContent={true} />;

interface NavBarRouterProps {}
/** Handles the routing for content displayed in the NavBar */
export const NavBarRouter: React.FC<NavBarRouterProps> = () => {
  const { registry } = useExternalConfigurationContext();

  const ExternalNav = registry?.nav;
  const useSubNavigation = registry?.useSubNavigation;

  const MainNavBar = ExternalNav || NavBar;
  return (
    <>
      <Switch>
        <Route
          path={Routes.ExecutionDetails.path}
          component={useSubNavigation ? MainNavBar : CustomNavBar}
        />
        <Route component={MainNavBar} />
      </Switch>
    </>
  );
};
