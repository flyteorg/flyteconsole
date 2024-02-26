import { useFlyteApi } from '@clients/flyte-api/ApiProvider';
import { getAxiosApiCall } from '@clients/flyte-api/utils/getAxiosApiCall';
import { UserProfile } from '../../models/Common/types';
import { useFetchableData } from './useFetchableData';

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
