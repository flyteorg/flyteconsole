import { useFlyteApi, getAxiosApiCall } from '@flyteconsole/flyte-api';
import { useFetchableData } from './useFetchableData';

export interface UserProfile {
  subject: string;
  name: string;
  preferredUsername: string;
  givenName: string;
  familyName: string;
  email: string;
  picture: string;
}

/** State hook that returns the user information if logged in, null otherwise */
export function useUserProfile() {
  const { getProfileUrl } = useFlyteApi();
  const profilePath = getProfileUrl();

  return useFetchableData<UserProfile | null>({
    debugName: 'UserProfile',
    defaultValue: null,
    doFetch: () => getAxiosApiCall(profilePath),
    useCache: true,
  });
}
