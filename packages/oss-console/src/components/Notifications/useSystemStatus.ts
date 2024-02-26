import { useAPIContext } from '../data/apiContext';
import { FetchableData } from '../hooks/types';
import { useFetchableData } from '../hooks/useFetchableData';
import { defaultSystemStatus } from '../../models/Common/constants';
import { SystemStatus } from '../../models/Common/types';

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
