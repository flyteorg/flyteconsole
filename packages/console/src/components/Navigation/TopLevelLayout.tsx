import React from 'react';
import { Grid, styled, makeStyles, Box } from '@material-ui/core';
import { ContentContainer } from 'components/common/ContentContainer';
import { useExternalConfigurationContext } from 'basics/ExternalConfigurationProvider';
import { FeatureFlag, useFeatureFlag } from 'basics/FeatureFlags';
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
      position: 'relative',
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
    sideNavAnimation: {
      // causes jank when animating side nav
      animationName: `$sideNavAnimation`,
      animationEasing: `${theme.transitions.easing.easeInOut}`,
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
      animationDirection: 'forward',
    },
  }))();

  const { isSideNavOpen } = React.useContext(TopLevelLayoutContext);
  const isInlineHeader = useFeatureFlag(FeatureFlag.InlineHeader) ?? false;

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
