import * as React from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import classnames from 'classnames';
import { AppInfo, VersionInfo } from '@flyteorg/components';
import { FlyteLogo } from '@flyteorg/ui-atoms';
import { useCommonStyles } from 'components/common/styles';
import { Link } from 'react-router-dom';
import { Routes } from 'routes/routes';
import { FeatureFlag, useFeatureFlag } from 'basics/FeatureFlags';
import { useAdminVersion } from 'components/hooks/useVersion';
import { env } from '@flyteorg/common';
import { Box, Grid, IconButton } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import debounce from 'lodash/debounce';
import { NavigationDropdown } from './NavigationDropdown';
import { UserInformation } from './UserInformation';
import { OnlyMine } from './OnlyMine';
import { FlyteNavItem } from './utils';
import t, { patternKey } from './strings';
import { TopLevelLayoutContext } from './TopLevelLayoutState';

interface DefaultAppBarProps {
  items: FlyteNavItem[];
  console?: string;
}

/** Renders the default content for the app bar, which is the logo and help links */
export const DefaultAppBarContent = (props: DefaultAppBarProps) => {
  const [platformVersion, setPlatformVersion] = React.useState('');
  const [consoleVersion, setConsoleVersion] = React.useState('');
  const {
    isMobileNav,
    openSideNav,
    closeSideNav,
    isSideNavOpen,
    isLayoutHorizontal,
    showMobileNav,
    hideMobileNav,
  } = React.useContext(TopLevelLayoutContext);

  const commonStyles = useCommonStyles();

  const isFlagEnabled = useFeatureFlag(FeatureFlag.OnlyMine);
  const { adminVersion } = useAdminVersion();
  const isGAEnabled = env.ENABLE_GA === 'true' && env.GA_TRACKING_ID !== '';

  const handleSideNavToggle = React.useCallback(() => {
    return isSideNavOpen ? closeSideNav() : openSideNav();
  }, [isSideNavOpen, openSideNav, closeSideNav]);

  const theme = useTheme();

  // Enable / Disable mobile nav behaviour based on screen size
  React.useLayoutEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < theme.breakpoints.values.md) {
        if (!isMobileNav) {
          showMobileNav();
          closeSideNav();
        }
      } else if (isMobileNav) {
        hideMobileNav();
        closeSideNav();
      }
    };
    handleResize();
    const debouncedResize = debounce(handleResize, 50);
    window.addEventListener('resize', debouncedResize);
    return () => window.removeEventListener('resize', debouncedResize);
  }, [closeSideNav, theme.breakpoints.values.md]);

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

  const styles = makeStyles(() => ({
    wordmark: {
      position: 'relative',
      paddingTop: theme.spacing(2.75),
      '& > svg': {
        height: '22px',
        transform: 'translateX(-34px)',
        marginTop: '4px',
        top: '0',
        position: 'absolute',
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
      direction={isLayoutHorizontal ? 'column' : 'row'}
      justifyContent="space-between"
      alignItems="center"
      style={{ width: '100%', height: '100%' }}
    >
      <Grid item>
        <Grid
          container
          direction={isLayoutHorizontal ? 'column-reverse' : 'row'}
          alignItems="center"
          spacing={2}
        >
          {isMobileNav && (
            <Grid item className={styles.flex}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleSideNavToggle}
              >
                <MenuIcon>menu</MenuIcon>
              </IconButton>
            </Grid>
          )}
          <Grid item className={styles.flex}>
            <Link
              className={
                isLayoutHorizontal
                  ? commonStyles.linkUnstyled
                  : classnames(commonStyles.linkUnstyled, styles.flex)
              }
              to={Routes.SelectProject.path}
            >
              <FlyteLogo size={32} hideText={isLayoutHorizontal} />
              {isLayoutHorizontal && (
                <Box className={styles.wordmark}>
                  <FlyteLogo size={32} />
                </Box>
              )}
            </Link>
            {props.items?.length > 0 && (
              <NavigationDropdown items={props.items} console={props.console} />
            )}
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <Grid
          container
          direction={isLayoutHorizontal ? 'column' : 'row'}
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
            <Box mx={-0.5} my={-1}>
              <AppInfo
                versions={versions}
                documentationUrl="https://docs.flyte.org/en/latest/"
              />
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default DefaultAppBarContent;
