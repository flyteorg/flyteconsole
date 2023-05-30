import React, { useEffect } from 'react';
import { Grid, styled, makeStyles, Box } from '@material-ui/core';
import { ContentContainer } from 'components/common/ContentContainer';
import { useExternalConfigurationContext } from 'basics/ExternalConfigurationProvider';
import { FeatureFlag, useFeatureFlag } from 'basics/FeatureFlags';
import { sideNavGridWidth } from 'common/layout';
import { TopLevelLayoutContext } from './TopLevelLayoutState';

const GrowGrid = styled(Grid)(() => ({
  display: 'flex',
  flexGrow: 1,
}));

const TopLevelLayout = ({
  headerComponent,
  sideNavigationComponent,
  routerView,
}: {
  headerComponent: JSX.Element;
  sideNavigationComponent: JSX.Element;
  routerView: JSX.Element;
}) => {
  const HeaderComponent = () => headerComponent;
  const SideNavigationComponent = () => sideNavigationComponent;
  const RouterView = () => routerView;

  const { registry } = useExternalConfigurationContext();
  const ExternalTopLevelLayout = registry?.topLevelLayout;

  const styles = makeStyles(theme => ({
    sticky: {
      position: 'sticky',
      top: 0,
    },
    relative: {
      position: 'relative',
    },
    absolute: {
      position: 'absolute',
    },
    w100: {
      width: '100%',
    },
    h100: {
      minHeight: '100dvh',
    },
    above: {
      zIndex: 1,
    },
    mobileNav: {
      zIndex: 2,
      position: 'fixed',
      height: '100%',
      minWidth: theme.spacing(sideNavGridWidth),
      background: theme.palette.background.paper,
      boxShadow: theme.shadows[4],
    },
    sideNavAnimation: {
      animationName: `$sideNavAnimation`,
      animationTimingFunction: `${theme.transitions.easing.easeInOut}`,
      animationDuration: `300ms`,
      animationFillMode: 'forwards',
    },
    '@keyframes sideNavAnimation': {
      '0%': {
        opacity: 0,
        display: 'none',
      },
      '1%': {
        opacity: 0,
        transform: 'translateX(-20%)',
        display: 'block',
      },
      '99%': {
        opacity: 1,
        transform: 'translateX(0)',
      },
      '100%': {
        opacity: 1,
        display: 'block',
      },
    },
    closeSideNav: {
      animationDirection: 'reverse',
      display: 'none',
    },
    openSideNav: {
      animationDirection: 'normal',
    },
  }))();

  const { isMobileNav, isSideNavOpen, openSideNav, closeSideNav } =
    React.useContext(TopLevelLayoutContext);
  const isInlineHeader = useFeatureFlag(FeatureFlag.InlineHeader) ?? false;

  // useEffect to listen to window resize events
  useEffect(() => {
    if (isMobileNav) {
      closeSideNav();
    } else {
      openSideNav();
    }
  }, [isMobileNav]);

  return (
    <>
      {ExternalTopLevelLayout ? (
        <ExternalTopLevelLayout />
      ) : (
        <>
          <Grid
            className={`top-level-layout ${styles.h100}`}
            container
            direction={isInlineHeader ? 'row' : 'column'}
            justifyContent="flex-start"
            alignItems="stretch"
          >
            <Grid
              item
              className={`sticky-header-container
              ${isInlineHeader ? '' : styles.sticky} 
              ${isInlineHeader ? '' : styles.above}`}
            >
              <HeaderComponent />
            </Grid>
            <GrowGrid item>
              {/* Grow X Axis */}
              <GrowGrid
                container
                direction="row"
                alignItems="stretch"
                justifyContent="flex-start"
                className={`${styles.relative}`}
              >
                <Grid
                  item
                  className={`side-nav-container
                    ${styles.relative}
                    ${isMobileNav ? styles.mobileNav : ''}
                    ${styles.sideNavAnimation}
                    ${isSideNavOpen ? styles.openSideNav : styles.closeSideNav}
                  `}
                >
                  <SideNavigationComponent />
                </Grid>
                <GrowGrid item className={`${styles.relative}`}>
                  <Grid container>
                    <Grid item className={`${styles.absolute} ${styles.w100}`}>
                      <Box className={`${styles.relative}`}>
                        {/* Legacy, need to move to <Grid/> */}
                        <ContentContainer className="routerview-content-container flex-column-container">
                          <RouterView />
                        </ContentContainer>
                      </Box>
                    </Grid>
                  </Grid>
                </GrowGrid>
              </GrowGrid>
            </GrowGrid>
          </Grid>
        </>
      )}
    </>
  );
};

export default TopLevelLayout;
