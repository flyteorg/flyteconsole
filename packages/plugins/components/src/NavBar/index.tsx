import * as React from 'react';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { DefaultNavBarContent } from './defaultContent';

export const navBarContentId = 'nav-bar-content';

export interface NavBarProps {
  useCustomContent?: boolean; // rename to show that it is a backNavigation
  className?: string;
}

/** Contains all content in the top navbar of the application. */
export const NavBar = (props: NavBarProps) => {
  return (
    <AppBar
      color="secondary"
      elevation={0}
      id="navbar"
      position="fixed"
      className={props.className as string}
    >
      <Toolbar id={navBarContentId}>
        <DefaultNavBarContent />
      </Toolbar>
    </AppBar>
  );
};

export const add = (a: number, b: number) => {
  return a + b;
};
