import { useFlyteApi } from '@clients/flyte-api/ApiProvider';
import { getFetchApiCall } from '@clients/flyte-api/utils/getFetchApiCall';
import { UserProfile } from '../../models/Common/types';
import { useFetchableData } from './useFetchableData';

/** State hook that returns the user information if logged in, null otherwise */
export function useUserProfile() {
  const { getProfileUrl } = useFlyteApi();
  const profilePath = getProfileUrl();

  return useFetchableData<UserProfile | null>({
    debugName: 'UserProfile',
    defaultValue: null,
    doFetch: () => getFetchApiCall(profilePath),
    useCache: true,
  });
}
