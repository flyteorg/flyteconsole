import React from 'react';
import { Grid, styled, makeStyles, Box } from '@material-ui/core';
import { ContentContainer } from 'components/common/ContentContainer';
import { useExternalConfigurationContext } from 'basics/ExternalConfigurationProvider';
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

  const styles = makeStyles(() => ({
    sticky: {
      position: 'sticky',
      top: 0,
    },
    above: {
      zIndex: 1,
    },
    sideNav: {
      // causes jank when animating side nav
      // transition: 'all 0.3s ease',
    },
    closeSideNav: {
      display: 'none',
      left: '-100%',
    },
    openSideNav: {
      display: 'block',
      left: 0,
    },
  }))();

  const { isSideNavOpen } = React.useContext(TopLevelLayoutContext);

  return (
    <>
      {ExternalTopLevelLayout ? (
        <ExternalTopLevelLayout />
      ) : (
        <>
          {/* <style>
        {`.top-level-layout, .top-level-layout * {background: rgb(39 1 255 / 10%) !important; border: 1px solid black !important;}`}
      </style> */}
          <Grid
            className="top-level-layout"
            container
            direction="column"
            justifyContent="flex-start"
            alignItems="stretch"
            style={{ minHeight: '100dvh' }} // Full screen acounting for mobile browser UI
          >
            <Grid
              item
              className={`${styles.sticky} ${styles.above} sticky-header-container`}
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
                style={{ position: 'relative' }}
              >
                <Grid
                  item
                  style={{ position: 'relative' }}
                  className={`side-nav-container ${styles.sideNav}
                ${isSideNavOpen ? styles.openSideNav : styles.closeSideNav}`}
                >
                  <SideNavigationComponent />
                </Grid>
                <GrowGrid item style={{ position: 'relative' }}>
                  <Grid container>
                    <Grid item style={{ position: 'absolute', width: '100%' }}>
                      <Box style={{ position: 'relative' }}>
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
