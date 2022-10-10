import { render, waitFor } from '@testing-library/react';
import { FetchableData, useUserProfile, UserProfile } from '@flyteconsole/components';
import { loadedFetchable } from 'components/hooks/__mocks__/fetchableData';
import * as React from 'react';

import { UserInformation } from '../UserInformation';

jest.mock('@flyteconsole/components', () => {
  const originalModule = jest.requireActual('@flyteconsole/components');

  return {
    __esModule: true,
    ...originalModule,
    useUserProfile: jest.fn(),
  };
});

describe('UserInformation', () => {
  const sampleUserProfile: UserProfile = {
    preferredUsername: 'testUser@example.com',
  } as UserProfile;

  const mockUseUserProfile = useUserProfile as jest.Mock<FetchableData<UserProfile | null>>;

  it('Shows login link if no user profile exists', async () => {
    mockUseUserProfile.mockReturnValue(loadedFetchable(null, jest.fn()));
    const { getByText } = render(<UserInformation />);

    await waitFor(() => getByText('Login'));
    expect(mockUseUserProfile).toHaveBeenCalled();

    const element = getByText('Login');
    expect(element).toBeInTheDocument();
    expect(element.tagName).toBe('A');
  });

  it('Shows user preferredName if profile exists', async () => {
    mockUseUserProfile.mockReturnValue(loadedFetchable(sampleUserProfile, jest.fn()));
    const { getByText } = render(<UserInformation />);

    await waitFor(() => getByText(sampleUserProfile.preferredUsername));
    expect(mockUseUserProfile).toHaveBeenCalled();
    expect(getByText(sampleUserProfile.preferredUsername)).toBeInTheDocument();
  });
});
