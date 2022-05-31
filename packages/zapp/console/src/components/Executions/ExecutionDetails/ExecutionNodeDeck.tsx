import { useNodeExecutionData } from 'components/hooks/useNodeExecution';
import { NodeExecutionIdentifier } from 'models/Execution/types';
import * as React from 'react';

/** Fetches and renders the deck data for a given `NodeExecutionIdentifier` */
export const ExecutionNodeDeck: React.FC<{ nodeExecutionId: NodeExecutionIdentifier }> = ({
  nodeExecutionId,
}) => {
  const executionData = useNodeExecutionData(nodeExecutionId);
  return (
    <iframe
      title="deck"
      height="600"
      src="https://deck-test2.tiiny.site/" // executionData.value.deckUri
    />
  );
};
