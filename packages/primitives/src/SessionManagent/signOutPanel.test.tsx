import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { muiTheme } from '@clients/theme/Theme/muiTheme';
import { ThemeProvider } from '@mui/material/styles';
import { SignOutPanel } from './SignOutPanel';

jest.mock('@clients/flyte-api/ApiProvider', () => ({
  useFlyteApi: () => ({ getLogoutUrl: () => '/logout?redirect_url=/select-project' }),
}));

const Wrapper = (props: { children: React.ReactNode }) => (
  <ThemeProvider theme={muiTheme}>{props.children}</ThemeProvider>
);

describe('SignOutPanel', () => {
  it('renders nothing while closed', () => {
    const { queryByText } = render(
      <Wrapper>
        <SignOutPanel open={false} onCancel={jest.fn()} />
      </Wrapper>,
    );
    expect(queryByText('Sign out of Flyte?')).not.toBeInTheDocument();
  });

  it('confirms to the logout url and cancels without leaving', () => {
    const onCancel = jest.fn();
    const { getByText, getByRole } = render(
      <Wrapper>
        <SignOutPanel open onCancel={onCancel} />
      </Wrapper>,
    );

    expect(getByText('Sign out of Flyte?')).toBeInTheDocument();
    expect(getByRole('link', { name: 'Sign Out' })).toHaveAttribute(
      'href',
      '/logout?redirect_url=/select-project',
    );

    fireEvent.click(getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalled();
  });
});
