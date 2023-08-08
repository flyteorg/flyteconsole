import { useDownloadLink } from 'components/hooks/useDataProxy';
import { WaitForData } from 'components/common/WaitForData';
import * as React from 'react';
import { Core } from '@flyteorg/flyteidl-types';
import { NotFoundError } from 'errors/fetchErrors';

/** Fetches and renders the deck data for a given `nodeExecutionId` */
export const ExecutionNodeDeck: React.FC<{
  nodeExecutionId: Core.NodeExecutionIdentifier;
  className?: string;
}> = ({ nodeExecutionId, className = '' }) => {
  const downloadLink = useDownloadLink(nodeExecutionId);

  if (downloadLink?.lastError instanceof NotFoundError) {
    return (
      <div style={{ textAlign: 'center' }}>
        <h1>The deck will be ready soon. Please try again later.</h1>
        <p>
          If you're using the real-time deck, it's because the 'persist'
          function has not been invoked yet.
        </p>
        <p>
          If you're not using the real-time deck, it's because the corresponding
          task is still in progress.
        </p>
      </div>
    );
  }

  return (
    <WaitForData {...downloadLink}>
      <iframe
        title="deck"
        width="100%"
        height="100%"
        src={downloadLink?.value?.signedUrl?.[0]}
        className={className}
        style={{ border: 'none' }}
      />
    </WaitForData>
  );
};
