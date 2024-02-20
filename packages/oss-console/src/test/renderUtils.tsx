import React from 'react';
import { render } from '@testing-library/react';
import StyledEngineProvider from '@mui/material/StyledEngineProvider';
import { muiTheme } from '@clients/theme/Theme/muiTheme';
import ThemeProvider from '@mui/system/ThemeProvider';

export const renderTest = (ui, options = undefined) => {
  return render(
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={muiTheme}>{ui}</ThemeProvider>
    </StyledEngineProvider>,
    options,
  );
};
