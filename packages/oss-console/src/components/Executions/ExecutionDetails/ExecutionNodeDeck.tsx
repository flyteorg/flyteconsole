import React from 'react';
import Core from '@clients/common/flyteidl/core';
import { LoadingSpinner } from '@clients/primitives/LoadingSpinner';
import { useDownloadLink } from '../../hooks/useDataProxy';
import { WaitForData } from '../../common/WaitForData';

/** Fetches and renders the deck data for a given `nodeExecutionId` */
export const ExecutionNodeDeck: React.FC<{
  nodeExecutionId: Core.NodeExecutionIdentifier;
  className?: string;
}> = ({ nodeExecutionId, className = '' }) => {
  const downloadLink = useDownloadLink(nodeExecutionId);
  const iFrameSrc = downloadLink?.value?.signedUrl?.[0];

  // Taken from https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#sandbox
  const sandboxRules = [
    'allow-forms',
    'allow-modals',
    'allow-orientation-lock',
    'allow-pointer-lock',
    'allow-popups',
    'allow-popups-to-escape-sandbox',
    'allow-presentation',
    'allow-same-origin',
    'allow-scripts',
    'allow-top-navigation-by-user-activation',
    'allow-downloads',
  ].join(' ');

  return (
    <WaitForData {...downloadLink} loadingComponent={LoadingSpinner}>
      <iframe
        title="deck"
        src={iFrameSrc}
        width="100%"
        height="100%"
        className={className}
        sandbox={sandboxRules}
        style={{
          border: 'none',
          width: '100%',
          height: '100%',
        }}
        allow="clipboard-write"
      />
    </WaitForData>
  );
};
