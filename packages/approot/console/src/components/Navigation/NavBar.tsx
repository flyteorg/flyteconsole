import { makeStyles, Theme } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { navBarContentId } from 'common/constants';
import * as React from 'react';
import { DefaultAppBarContent } from './DefaultAppBarContent';
import { TestNavBar } from './Header';
import { FlyteNavigation, getFlyteNavigationData } from './utils';

export interface NavBarProps {
  useCustomContent?: boolean;
  navigationData?: FlyteNavigation;
}
const useStyles = makeStyles((theme: Theme) => ({
  innerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(0, 3),
    height: theme.spacing(8),
    [theme.breakpoints.only('xl')]: {
      width: '1536px',
      alignSelf: 'center',
    },
  },
}));

/** Contains all content in the top navbar of the application. */
export const NavBar = (props: NavBarProps) => {
  const styles = useStyles();
  const navData = props.navigationData ?? getFlyteNavigationData();
  const content = props.useCustomContent ? (
    <div id={navBarContentId} />
  ) : (
    // <DefaultAppBarContent items={navData?.items ?? []} console={navData?.console} />
    <TestNavBar />
  );

  return (
    <AppBar
      color="secondary"
      elevation={0}
      id="navbar"
      position="fixed"
      style={{ color: navData?.color, background: navData?.background }}
    >
      <Toolbar id={navBarContentId} className={styles.innerContainer}>
        {content}
      </Toolbar>
    </AppBar>
  );
};
