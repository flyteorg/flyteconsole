import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { navBarContentId } from 'common/constants';
import * as React from 'react';
import {
  env,
  FlyteNavigation,
  useAdminVersion,
  VersionInfo,
  DefaultAppBarContent,
  Routes,
} from '@flyteconsole/components';
import { getFlyteNavigationData } from './utils';
import t, { patternKey } from './strings';

const { version: platformVersion } = require('../../../package.json');

export interface NavBarProps {
  useCustomContent?: boolean;
  navigationData?: FlyteNavigation;
}

export interface DefaultAppBarContentWrapperProps extends NavBarProps {}
export const DefaultAppBarContentWrapper = (props: DefaultAppBarContentWrapperProps) => {
  const navData = props.navigationData;
  const { adminVersion } = useAdminVersion();

  const versions: VersionInfo[] = React.useMemo(
    () => [
      {
        name: t('versionConsoleUi'),
        version: platformVersion,
        url: `https://github.com/flyteorg/flyteconsole/releases/tag/v${platformVersion}`,
      },
      {
        name: t('versionAdmin'),
        version: adminVersion,
        url: `https://github.com/flyteorg/flyteadmin/releases/tag/v${adminVersion}`,
      },
      {
        name: t('versionGoogleAnalytics'),
        version: t(patternKey('gaDisable', env.DISABLE_GA)),
        url: 'https://github.com/flyteorg/flyteconsole#google-analytics',
      },
    ],
    [],
  );

  const content = props.useCustomContent ? (
    <div id={navBarContentId} />
  ) : (
    <DefaultAppBarContent
      routes={Routes}
      versions={versions}
      items={navData?.items ?? []}
      console={navData?.console}
    />
  );

  return content;
};

/** Contains all content in the top navbar of the application. */
export const NavBar = (props: NavBarProps) => {
  const navData = props.navigationData ?? getFlyteNavigationData();

  return (
    <AppBar
      color="secondary"
      elevation={0}
      id="navbar"
      position="fixed"
      style={{ color: navData?.color, background: navData?.background }}
    >
      <Toolbar id={navBarContentId}>
        <DefaultAppBarContentWrapper {...props} />
      </Toolbar>
    </AppBar>
  );
};
