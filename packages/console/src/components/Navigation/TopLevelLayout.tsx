import React from 'react';
import {
  Grid,
  AppBar,
  Button,
  Toolbar,
  IconButton,
  Typography,
  styled,
  makeStyles,
  Box,
} from '@material-ui/core';

const GrowGrid = styled(Grid)(({ theme }) => ({
  display: 'flex',
  flexGrow: 1,
}));

const FlexGrid = styled(Grid)(({ theme }) => ({
  display: 'flex',
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

  const styles = makeStyles(() => ({
    sticky: {
      position: 'sticky',
      top: 0,
    },
  }))();

  return (
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
        <Grid item className={styles.sticky}>
          <HeaderComponent />
        </Grid>
        <GrowGrid item>
          {/* Grow X Axis */}
          <GrowGrid
            container
            direction="row"
            alignItems="stretch"
            justifyContent="flex-start"
          >
            <Grid item style={{ position: 'relative' }}>
              <SideNavigationComponent />
            </Grid>
            <GrowGrid item style={{ position: 'relative' }}>
              <Grid container>
                <Grid item style={{ position: 'absolute', width: '100%' }}>
                  <Box style={{ position: 'relative' }}>
                    {/* <div>Foo</div> */}
                    <RouterView />
                  </Box>
                </Grid>
              </Grid>
            </GrowGrid>
          </GrowGrid>
        </GrowGrid>
      </Grid>
    </>
  );
};

export default TopLevelLayout;
