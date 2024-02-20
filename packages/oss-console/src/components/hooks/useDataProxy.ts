import Core from '@clients/common/flyteidl/core';
import Service from '@clients/common/flyteidl/service';
import { useAPIContext } from '../data/apiContext';
import { FetchableData } from './types';
import { useFetchableData } from './useFetchableData';

/** A hook for fetching a NodeExecution */
export function useDownloadLink(
  nodeExecutionId: Core.NodeExecutionIdentifier,
): FetchableData<Service.CreateDownloadLinkResponse> {
  const { createDownloadLink } = useAPIContext();
  return useFetchableData<Service.CreateDownloadLinkResponse, Core.NodeExecutionIdentifier>(
    {
      debugName: 'CreateDownloadLink',
      defaultValue: {} as Service.CreateDownloadLinkResponse,
      doFetch: (nodeExecutionId) => createDownloadLink(nodeExecutionId),
    },
    nodeExecutionId,
  );
}
