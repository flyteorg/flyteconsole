import { useAPIContext } from 'components/data/apiContext';
import {
  FetchableData,
  useFetchableData,
  SystemStatus,
  defaultSystemStatus,
} from '@flyteconsole/components';

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
