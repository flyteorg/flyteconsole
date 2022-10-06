import { makeStyles, Theme } from '@material-ui/core/styles';
import classnames from 'classnames';
import { AppInfo, NavigationDropdown, VersionInfo, FlyteNavItem } from '@flyteconsole/components';
import { FlyteLogo } from '@flyteconsole/ui-atoms';
import { useCommonStyles } from 'components/common/styles';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Routes } from 'routes/routes';
import { FeatureFlag, useFeatureFlag } from 'basics/FeatureFlags';
import { useAdminVersion } from 'components/hooks/useVersion';
import { env } from '@flyteconsole/components';
import { baseUrlString, makeRoute } from 'routes/utils';
import { headerFontFamily } from 'components/Theme/constants';
import { UserInformation } from './UserInformation';
import { OnlyMine } from './OnlyMine';
import t, { patternKey } from './strings';

const { version: platformVersion } = require('../../../package.json');

const useStyles = makeStyles((theme: Theme) => ({
  spacer: {
    flexGrow: 1,
  },
  rightNavBarItem: {
    marginLeft: theme.spacing(2),
  },
}));

interface DefaultAppBarProps {
  items: FlyteNavItem[];
  console?: string;
}

/** Renders the default content for the app bar, which is the logo and help links */
export const DefaultAppBarContent = (props: DefaultAppBarProps) => {
  const { console, items } = props;

  const commonStyles = useCommonStyles();
  const styles = useStyles();

  const isFlagEnabled = useFeatureFlag(FeatureFlag.OnlyMine);
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

  const dropdownMenuItems = React.useMemo(
    () => [
      {
        title: console ?? 'Console',
        url: makeRoute('/'),
      },
      ...items,
    ],
    [],
  );

  return (
    <>
      <Link className={classnames(commonStyles.linkUnstyled)} to={Routes.SelectProject.path}>
        <FlyteLogo size={32} />
      </Link>
      {items?.length > 0 ? (
        <NavigationDropdown
          config={{ headerFontFamily: headerFontFamily }}
          baseUrl={baseUrlString}
          items={dropdownMenuItems}
        />
      ) : (
        false
      )}
      <div className={styles.spacer} />
      {isFlagEnabled && <OnlyMine />}
      <UserInformation />
      <AppInfo versions={versions} documentationUrl="https://docs.flyte.org/en/latest/" />
    </>
  );
};
