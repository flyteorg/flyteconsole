import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { navBarContentId } from 'common/constants';
import { COLOR_SPECTRUM } from 'components/Theme/colorSpectrum';
import { whiteColor } from 'components/Theme/constants';
import { FlyteNavigation } from '@flyteorg/common';
import * as React from 'react';
import { DefaultAppBarContent } from './DefaultAppBarContent';
import { getFlyteNavigationData } from './utils';

export interface NavBarProps {
  useCustomContent?: boolean;
  navigationData?: FlyteNavigation;
}

/** Contains all content in the top navbar of the application. */
export const NavBar = (props: NavBarProps) => {
  const navData = props.navigationData ?? getFlyteNavigationData();
  const content = props.useCustomContent ? (
    <div id={navBarContentId} />
  ) : (
    <DefaultAppBarContent
      items={navData?.items ?? []}
      console={navData?.console}
    />
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
