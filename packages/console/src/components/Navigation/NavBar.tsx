import * as React from 'react';
import { Suspense, lazy } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { navBarContentId } from 'common/constants';
import { FlyteNavigation } from '@flyteorg/common';
import { getFlyteNavigationData } from './utils';

export interface NavBarProps {
  useCustomContent?: boolean;
  navigationData?: FlyteNavigation;
}

const DefaultAppBarContent = lazy(() => import('./DefaultAppBarContent'));

/** Contains all content in the top navbar of the application. */
export const NavBar = (props: NavBarProps) => {
  const navData = props.navigationData ?? getFlyteNavigationData();
  const content = props.useCustomContent ? (
    <div id={navBarContentId} />
  ) : (
    <Suspense fallback={null}>
      <DefaultAppBarContent
        items={navData?.items ?? []}
        console={navData?.console}
      />
    </Suspense>
  );

  return (
    <AppBar
      color="secondary"
      elevation={0}
      id="navbar"
      style={{
        color: navData?.color,
        background: navData?.background,
        position: 'fixed',
      }}
    >
      <Toolbar id={navBarContentId}>{content}</Toolbar>
    </AppBar>
  );
};

export default NavBar;
