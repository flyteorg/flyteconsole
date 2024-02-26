import * as React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { muiTheme } from '@clients/theme/Theme/muiTheme';
import { LiteralMap } from '../../../models/Common/types';
import { LiteralMapViewer } from '../LiteralMapViewer';

describe('LiteralMapViewer', () => {
  it('renders sorted keys', () => {
    const literals: LiteralMap = {
      literals: {
        input2: {},
        input1: {},
      },
    };
    const { getAllByText } = render(
      <ThemeProvider theme={muiTheme}>
        <LiteralMapViewer map={literals} />
      </ThemeProvider>,
    );
    const labels = getAllByText(/input/);
    expect(labels.length).toBe(2);
    expect(labels[0]).toHaveTextContent(/input1/);
    expect(labels[1]).toHaveTextContent(/input2/);
  });
});
