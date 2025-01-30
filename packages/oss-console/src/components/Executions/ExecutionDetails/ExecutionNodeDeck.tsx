import React from 'react';
import Core from '@clients/common/flyteidl/core';
import NotFoundError from '@clients/common/Errors/NotFoundError';
import { LoadingSpinner } from '@clients/primitives/LoadingSpinner';
import { useDownloadLink } from '../../hooks/useDataProxy';
import { WaitForData } from '../../common/WaitForData';

/** Fetches and renders the deck data for a given `nodeExecutionId` */
export const ExecutionNodeDeck: React.FC<{
  nodeExecutionId: Core.NodeExecutionIdentifier;
  className?: string;
  downloadLink: ReturnType<typeof useDownloadLink>;
}> = ({ className = '', downloadLink }) => {
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

  /**
   * if the download link query has an error other than 404, we show a 'pretty' message to the user.
   * else: we show the built in DataError handler passed to the WaitForQuery component.
   */
  if (downloadLink?.lastError && !(downloadLink?.lastError instanceof NotFoundError)) {
    return (
      <div style={{ textAlign: 'center' }}>
        <h1>The deck will be ready soon. Please try again later.</h1>
        <p>
          If you're using the real-time deck, it's because the 'publish' function has not been
          invoked yet.
        </p>
        <p>
          If you're not using the real-time deck, it's because the corresponding task is still in
          progress.
        </p>
      </div>
    );
  }

  // 404 or no error case
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
