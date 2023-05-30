import * as React from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import classnames from 'classnames';
import { AppInfo, VersionInfo } from '@flyteorg/components';
import { FlyteLogo } from '@flyteorg/ui-atoms';
import { useCommonStyles } from 'components/common/styles';
import { Link } from 'react-router-dom';
import { Routes } from 'routes/routes';
import { FeatureFlag, useFeatureFlag } from 'basics/FeatureFlags';
import { useAdminVersion } from 'components/hooks/useVersion';
import { env } from '@flyteorg/common';
import { Box, Grid } from '@material-ui/core';
import { NavigationDropdown } from './NavigationDropdown';
import { UserInformation } from './UserInformation';
import { OnlyMine } from './OnlyMine';
import { FlyteNavItem } from './utils';
import t, { patternKey } from './strings';

interface DefaultAppBarProps {
  items: FlyteNavItem[];
  console?: string;
}

/** Renders the default content for the app bar, which is the logo and help links */
export const DefaultAppBarContent = (props: DefaultAppBarProps) => {
  const [platformVersion, setPlatformVersion] = React.useState('');
  const [consoleVersion, setConsoleVersion] = React.useState('');
  const commonStyles = useCommonStyles();

  const isFlagEnabled = useFeatureFlag(FeatureFlag.OnlyMine);
  const { adminVersion } = useAdminVersion();
  const isGAEnabled = env.ENABLE_GA === 'true' && env.GA_TRACKING_ID !== '';

  React.useEffect(() => {
    try {
      const { version } = require('../../../../../website/package.json');
      const { version: packageVersion } = require('../../../package.json');

      setPlatformVersion(version);
      setConsoleVersion(packageVersion);
    } catch {
      /* no-op */
    }
  }, []);
  const versions: VersionInfo[] = [
    {
      name: t('versionConsoleUi'),
      version: platformVersion,
      url: `https://github.com/flyteorg/flyteconsole/releases/tag/v${platformVersion}`,
    },
    {
      name: t('versionConsolePackage'),
      version: consoleVersion,
      url: `https://github.com/flyteorg/flyteconsole/tree/master/packages/console`,
    },
    {
      name: t('versionAdmin'),
      version: adminVersion,
      url: `https://github.com/flyteorg/flyteadmin/releases/tag/v${adminVersion}`,
    },
    {
      name: t('versionGoogleAnalytics'),
      version: t(patternKey('gaActive', isGAEnabled.toString())),
      url: 'https://github.com/flyteorg/flyteconsole#google-analytics',
    },
  ];

  const isInlineHeader = useFeatureFlag(FeatureFlag.InlineHeader) ?? false;

  const styles = makeStyles(() => ({
    wordmark: {
      '& > svg': {
        height: '22px',
        transform: 'translateX(-34px)',
        position: 'absolute',
        marginTop: '4px',
      },
      '& > svg > path:first-child': {
        display: 'none',
      },
    },
    flex: {
      display: 'flex',
    },
  }))();

  return (
    <Grid
      container
      direction={isInlineHeader ? 'column' : 'row'}
      justifyContent="space-between"
      alignItems="center"
      style={{ width: '100%', height: '100%' }}
    >
      <Grid item className={styles.flex}>
        <Link
          className={
            isInlineHeader
              ? commonStyles.linkUnstyled
              : classnames(commonStyles.linkUnstyled, styles.flex)
          }
          to={Routes.SelectProject.path}
        >
          <FlyteLogo size={32} hideText={isInlineHeader} />
          {isInlineHeader && (
            <Box className={styles.wordmark}>
              <FlyteLogo size={32} />
            </Box>
          )}
        </Link>
        {props.items?.length > 0 ? (
          <NavigationDropdown items={props.items} console={props.console} />
        ) : (
          false
        )}
      </Grid>
      <Grid item>
        <Grid
          container
          direction={isInlineHeader ? 'column' : 'row'}
          spacing={2}
          alignItems="center"
          justifyContent="center"
        >
          {isFlagEnabled && (
            <Grid item>
              <OnlyMine />
            </Grid>
          )}
          <Grid item>
            <UserInformation />
          </Grid>
          <Grid item className={styles.flex}>
            <AppInfo
              versions={versions}
              documentationUrl="https://docs.flyte.org/en/latest/"
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default DefaultAppBarContent;
