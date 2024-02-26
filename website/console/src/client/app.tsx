import React from 'react';
import { AppComponent as OSSApp } from '@clients/oss-console/App';
import StyledEngineProvider from '@mui/styled-engine/StyledEngineProvider';
import ThemeProvider from '@mui/system/ThemeProvider';
import { CommonStyles } from '@clients/theme/CommonStyles/CommonStyles';
import { muiTheme } from '@clients/theme/Theme/muiTheme';
import { BrowserRouter } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { DataProvider } from '@clients/primitives/hooks/DataProvider/DataProvider';
import { IdentityProvider } from '@clients/primitives/hooks/IdentityProvider/IdentityProvider';
import { FeatureFlagProvider } from '@clients/primitives/hooks/FeatureFlagsProvider/FeatureFlagProvider';

const WrappedApp = () => {
  return (
    <DataProvider>
      <IdentityProvider>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={muiTheme}>
            <CssBaseline />
            <CommonStyles />
            <OSSApp />
          </ThemeProvider>
        </StyledEngineProvider>
      </IdentityProvider>
    </DataProvider>
  );
};

function AppComponent() {
  return (
    <BrowserRouter>
      <FeatureFlagProvider>
        <WrappedApp />
      </FeatureFlagProvider>
    </BrowserRouter>
  );
}

export default AppComponent;
