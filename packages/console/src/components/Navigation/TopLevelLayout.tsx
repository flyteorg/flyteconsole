import React from 'react';
import {
  Grid,
  AppBar,
  Button,
  Toolbar,
  IconButton,
  Typography,
  styled,
} from '@material-ui/core';

const GrowGrid = styled(Grid)(({ theme }) => ({
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

  return (
    <>
      <style>
        {`.top-level-layout, .top-level-layout * {background: rgb(39 1 255 / 10%) !important; border: 1px solid black !important;}`}
      </style>
      <Grid
        className="top-level-layout"
        container
        direction="column"
        justifyContent="flex-start"
        alignItems="stretch"
        style={{ minHeight: '100dvh' }}
      >
        <Grid item>
          <HeaderComponent />
        </Grid>
        <GrowGrid item>
          {/* Grow X Axis */}
          <GrowGrid
            container
            direction="row"
            alignItems="stretch"
            justifyContent="flex-start"
            style={{ background: 'green' }}
          >
            <Grid item xs={3}>
              <SideNavigationComponent />
            </Grid>
            <GrowGrid item>
              <Grid container>
                <Grid item>
                  <RouterView />
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
