import React from 'react';
import { render } from '@testing-library/react';
import { muiTheme } from '@clients/theme/Theme/muiTheme';
import { ThemeProvider } from '@mui/material/styles';
import { Actions } from './Actions';
import { Flyte } from '../types/flyteTypes';

const minimalProfile: Flyte.Profile = {
  name: 'Test Tester',
  subject: 'user1',
  email: 'test@union.ai',
  familyName: 'Tester',
  givenName: 'Test',
  picture: '',
  preferredUsername: 'Test',
};

const defaultProfile: Flyte.Profile = {
  ...minimalProfile,
  preferredUsername: 'test@union.ai',
};

const Wrapper = (props: { children: React.ReactNode }) => {
  return <ThemeProvider theme={muiTheme}>{props.children}</ThemeProvider>;
};

// Add check that Settings button is hidden/present
describe('Login', () => {
  it.skip('should display Login button when user is not logged in', () => {
    const { queryByText, queryByTestId } = render(
      <Wrapper>
        <Actions currentBasePath="test" loading={false} />
      </Wrapper>,
    );
    expect(queryByText('Login')).toBeInTheDocument();
    expect(queryByTestId('settingsButton')).not.toBeInTheDocument();
  });

  it.skip('should display User`s name when user is logged in', () => {
    const { queryByText, queryByTestId } = render(
      <Wrapper>
        <Actions currentBasePath="test" loading={false} profile={minimalProfile} />
      </Wrapper>,
    );

    expect(queryByText('Login')).not.toBeInTheDocument();
    expect(queryByText(minimalProfile.name)).toBeInTheDocument();
    expect(queryByTestId('settingsButton')).toBeInTheDocument();
  });

  it.skip('should display User`s full name when user is logged in', () => {
    const { queryByText } = render(
      <Wrapper>
        <Actions currentBasePath="test" loading={false} profile={defaultProfile} />
      </Wrapper>,
    );

    expect(queryByText('Login')).not.toBeInTheDocument();
    expect(queryByText(minimalProfile.name)).toBeInTheDocument();
  });
});
