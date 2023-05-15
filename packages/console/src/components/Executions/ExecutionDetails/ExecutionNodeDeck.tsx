import { useDownloadLink } from 'components/hooks/useDataProxy';
import { WaitForData } from 'components/common/WaitForData';
import * as React from 'react';
import { Core } from '@flyteorg/flyteidl-types';

/** Fetches and renders the deck data for a given `nodeExecutionId` */
export const ExecutionNodeDeck: React.FC<{
  nodeExecutionId: Core.NodeExecutionIdentifier;
  className?: string;
}> = ({ nodeExecutionId, className = '' }) => {
  const downloadLink = useDownloadLink(nodeExecutionId);

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
