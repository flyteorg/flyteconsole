import { useAPIContext } from 'components/data/apiContext';
import { FetchableData } from '@flyteconsole/components';
import { useFetchableData } from 'components/hooks/useFetchableData';
import { defaultSystemStatus } from 'models/Common/constants';
import { SystemStatus } from 'models/Common/types';

/** Hook for fetching the current system status. Defaults to a safe value
 * indicating normal system status.
 */
export function useSystemStatus(): FetchableData<SystemStatus> {
  const { getSystemStatus } = useAPIContext();
  return useFetchableData({
    defaultValue: defaultSystemStatus,
    doFetch: getSystemStatus,
  });
}
