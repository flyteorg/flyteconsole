import * as React from 'react';
import { Suspense, lazy } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { navBarContentId } from 'common/constants';
import { FlyteNavigation } from '@flyteorg/common';
import { useExternalConfigurationContext } from 'basics/ExternalConfigurationProvider';
import { makeStyles } from '@material-ui/core';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import { getFlyteNavigationData } from './utils';
import { useTopLevelLayoutContext } from './TopLevelLayoutState';

export interface NavBarProps {
  useCustomContent?: boolean;
  navigationData?: FlyteNavigation;
}

const DefaultAppBarContent = lazy(() => import('./DefaultAppBarContent'));

/** Contains all content in the top navbar of the application. */
export const NavBar = (props: NavBarProps) => {
  const navData = props.navigationData ?? getFlyteNavigationData();
  const layoutState = useTopLevelLayoutContext();

  const styles = makeStyles(theme => ({
    stackedSpacer: theme.mixins.toolbar as CSSProperties,
    horizontalSpacer: {
      width: '80px',
    },
    navBar: {
      color: navData?.color,
      background: navData?.background,
      top: 0,
    },
    inlineNavBar: {
      width: '80px',
      height: '100%',
      position: 'fixed',
      inset: '0',
    },
    inlineToolBar: {
      padding: theme.spacing(2, 0, 4, 0),
      height: '100%',
    },
  }))();

  const { isLayoutHorizontal } = layoutState;

  const navBarContent = props.useCustomContent ? (
    <div id={navBarContentId} />
  ) : (
    <Suspense fallback={null}>
      <DefaultAppBarContent
        items={navData?.items ?? []}
        console={navData?.console}
      />
    </Suspense>
  );

  const { registry } = useExternalConfigurationContext();

  const ExternalNav = registry?.nav;

  return ExternalNav ? (
    <ExternalNav {...layoutState} />
  ) : (
    <>
      {isLayoutHorizontal ? (
        <div className={styles.horizontalSpacer} />
      ) : (
        <div className={styles.stackedSpacer} />
      )}
      <AppBar
        color="secondary"
        elevation={0}
        id="navbar"
        className={`
          ${styles.navBar} 
          ${isLayoutHorizontal ? styles.inlineNavBar : ''}
        `}
      >
        <Toolbar
          id={navBarContentId}
          className={isLayoutHorizontal ? styles.inlineToolBar : ''}
        >
          {navBarContent}
        </Toolbar>
      </AppBar>
    </>
  );
};

export default NavBar;
