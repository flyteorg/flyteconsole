import { useAPIContext } from 'components/data/apiContext';
import { DownloadLocation, useFetchableData, FetchableData } from '@flyteconsole/components';

/** A hook for fetching a NodeExecution */
export function useDownloadLocation(nativeUrl: string): FetchableData<DownloadLocation> {
  const { getDownloadLocation } = useAPIContext();
  return useFetchableData<DownloadLocation, string>(
    {
      debugName: 'CreateDownloadLocation',
      defaultValue: {} as DownloadLocation,
      doFetch: (nativeUrl) => getDownloadLocation(nativeUrl),
    },
    nativeUrl,
  );
}
