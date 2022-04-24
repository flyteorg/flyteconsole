import { useNodeExecutionData } from 'components/hooks/useNodeExecution';
import { NodeExecution } from 'models/Execution/types';
import * as React from 'react';

/** Fetches and renders the deck data for a given `NodeExecution` */
export const ExecutionNodeDeck: React.FC<{ execution: NodeExecution }> = ({ execution }) => {
    const executionData = useNodeExecutionData(execution.id);
    return (
        <iframe title="deck" height="600" src={executionData.value.deckUri}/>
    );
};
