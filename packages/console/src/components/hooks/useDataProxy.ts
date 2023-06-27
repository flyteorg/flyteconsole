import { useAPIContext } from 'components/data/apiContext';
import { Core, Service } from '@flyteorg/flyteidl-types';
import { useMutation } from 'react-query';
import { FetchableData } from './types';
import { useFetchableData } from './useFetchableData';

/** A hook for fetching a NodeExecution */
export function useDownloadLink(
  nodeExecutionId: Core.NodeExecutionIdentifier,
): FetchableData<Service.CreateDownloadLinkResponse> {
  const { createDownloadLink } = useAPIContext();
  return useFetchableData<
    Service.CreateDownloadLinkResponse,
    Core.NodeExecutionIdentifier
  >(
    {
      debugName: 'CreateDownloadLink',
      defaultValue: {} as Service.CreateDownloadLinkResponse,
      doFetch: nodeExecutionId => createDownloadLink(nodeExecutionId),
    },
    nodeExecutionId,
  );
}

interface UploadLocationVariables {
  project: string;
  domain: string;
  filename: string;
  contentMd5: Uint8Array;
  onSuccess: (signedUrl: string) => void;
}

/** A hook for uploading to s3 bucket */
export function useUploadLocation() {
  const { createUploadLocation } = useAPIContext();

  const { mutate, ...uploadState } = useMutation<
    Service.CreateUploadLocationResponse,
    Error,
    UploadLocationVariables
  >(
    async ({
      project,
      domain,
      filename,
      contentMd5,
    }: UploadLocationVariables) => {
      const res: Service.CreateUploadLocationResponse =
        await createUploadLocation(project, domain, filename, contentMd5);
      if (!res.signedUrl) {
        throw new Error('API Response did not include signed url');
      }
      return res;
    },
    {
      onSuccess: (res: Service.CreateUploadLocationResponse, { onSuccess }) => {
        onSuccess(res.signedUrl);
      },
    },
  );

  const upload = async (
    project: string,
    domain: string,
    filename: string,
    contentMd5: Uint8Array,
    onSuccess,
  ) => await mutate({ project, domain, filename, contentMd5, onSuccess });

  return {
    uploadState,
    upload,
  };
}
