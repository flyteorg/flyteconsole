import { fireEvent, render, waitFor } from '@testing-library/react';
import * as React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { muiTheme } from '@clients/theme/Theme/muiTheme';
import { APIContext, APIContextValue } from '../../data/apiContext';
import { mockAPIContextValue } from '../../data/__mocks__/apiContext';
import { StatusString, SystemStatus } from '../../../models/Common/types';
import { FetchableData } from '../../hooks/types';
import { SystemStatusBanner } from '../SystemStatusBanner';

jest.mock('../../../components/common/WaitForData', () => ({
  WaitForData: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// eslint-disable-next-line prefer-const
let systemStatus: SystemStatus = {
  status: 'normal',
  message: 'Everything is fine.',
};
jest.mock('../../../components/Notifications/useSystemStatus', () => ({
  useSystemStatus: (): FetchableData<SystemStatus> => {
    return {
      value: {
        ...systemStatus,
      },
    } as FetchableData<SystemStatus>;
  },
}));

describe('SystemStatusBanner', () => {
  let apiContext: APIContextValue;
  let getSystemStatus: jest.Mock<ReturnType<APIContextValue['getSystemStatus']>>;

  beforeEach(() => {
    systemStatus = { status: 'normal', message: 'Everything is fine.' };

    getSystemStatus = jest.fn().mockImplementation(() => Promise.resolve(systemStatus));
    apiContext = mockAPIContextValue({
      getSystemStatus,
    });
  });

  const renderStatusBanner = () =>
    render(
      <ThemeProvider theme={muiTheme}>
        <APIContext.Provider value={apiContext}>
          <SystemStatusBanner />
        </APIContext.Provider>
      </ThemeProvider>,
    );

  it('should display an info icon for normal status', async () => {
    const { getByTestId } = renderStatusBanner();
    await waitFor(() => {});

    expect(getByTestId('info-icon')).toBeInTheDocument();
  });

  it('should display a warning icon for degraded status', async () => {
    systemStatus.status = 'degraded';
    const { getByTestId } = renderStatusBanner();
    await waitFor(() => {});

    expect(getByTestId('warning-icon')).toBeInTheDocument();
  });

  it('should display a warning icon for down status', async () => {
    systemStatus.status = 'down';
    const { getByTestId } = renderStatusBanner();
    await waitFor(() => {});

    expect(getByTestId('warning-icon')).toBeInTheDocument();
  });

  it('should render normal status icon for any unknown status', async () => {
    systemStatus.status = 'unknown' as StatusString;
    const { getByTestId } = renderStatusBanner();
    await waitFor(() => {});

    expect(getByTestId('info-icon')).toBeInTheDocument();
  });

  it('should only display if a `message` property is present', async () => {
    delete systemStatus.message;
    const { queryByRole } = renderStatusBanner();
    await waitFor(() => {});
    expect(queryByRole('banner')).toBeNull();
  });

  it('should hide when dismissed by user', async () => {
    const { getByRole, queryByRole } = renderStatusBanner();
    await waitFor(() => {});

    expect(getByRole('banner')).toBeInTheDocument();

    const closeButton = getByRole('button');
    await fireEvent.click(closeButton);
    await waitFor(() => {});

    expect(queryByRole('banner')).toBeNull();
  });
});
