import { render, waitFor } from '@testing-library/react';
import * as React from 'react';
import { FetchableData } from '../FetchMachine';
import { UserProfile, useUserProfile } from '../hooks';
import { loadedFetchable } from '../hooks/__mocks__/fetchableData';

import { UserInformation } from './UserInformation';

jest.mock('../hooks/useUserProfile');

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
