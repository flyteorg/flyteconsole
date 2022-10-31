import { ThemeProvider } from '@material-ui/styles';
import * as React from 'react';
import { render, within, fireEvent, waitFor } from '@testing-library/react';

import { createMuiTheme } from '@material-ui/core';
import { NavigationDropdown } from '.';

const menuItems = [
  {
    title: 'Projects',
    url: '/console',
  },
  {
    title: 'Org',
    url: '/dashboard',
  },
];
const muiTheme = createMuiTheme({});

describe('NavigationDopdown', () => {
  it('dropdown opens on click', async () => {
    const { getByRole } = render(
      <ThemeProvider theme={muiTheme}>
        <NavigationDropdown
          items={menuItems}
          config={{ headerFontFamily: `"Open Sans", helvetica, arial, sans-serif` }}
        />
      </ThemeProvider>,
    );

    const defaultButton = getByRole('button');
    expect(defaultButton).not.toBeNull();

    expect(defaultButton.textContent).toEqual(menuItems[0].title);

    await fireEvent.mouseDown(defaultButton);
    const listbox = within(getByRole('listbox'));
    await waitFor(() => {
      expect(listbox.getAllByRole('option').length).toEqual(2);
    });

    await waitFor(() => {
      expect(listbox.getByText(menuItems[1].title)).toBeInTheDocument();
    });
  });
});
