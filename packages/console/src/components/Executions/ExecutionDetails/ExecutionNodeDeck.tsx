import React from 'react';
import { useDownloadLink } from 'components/hooks/useDataProxy';
import { Core } from '@flyteorg/flyteidl-types';
import { LoadingSpinner, WaitForData } from 'components/common';

/** Fetches and renders the deck data for a given `nodeExecutionId` */
export const ExecutionNodeDeck: React.FC<{
  nodeExecutionId: Core.NodeExecutionIdentifier;
  className?: string;
}> = ({ nodeExecutionId, className = '' }) => {
  const downloadLink = useDownloadLink(nodeExecutionId);
  const ref = React.useRef<HTMLIFrameElement>(null);
  const iFrameSrc = downloadLink?.value?.signedUrl?.[0];

  console.log('carina', { ref });
  return (
    <WaitForData {...downloadLink} loadingComponent={LoadingSpinner}>
      <iframe
        ref={ref}
        title="deck"
        src={iFrameSrc}
        className={className}
        style={{
          border: 'none',
          width: '100%',
          height: '100%',
        }}
      />
    </WaitForData>
  );
};
