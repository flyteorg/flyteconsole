import { useNodeExecutions, useWorkflow } from 'components/hooks';
import { NodeExecution, Workflow } from 'models';
import { useContext, useMemo } from 'react';
import { ExecutionContext } from './contexts';
import { NodeExecutionGroup } from './types';
import { mapNodeExecutionDetails, populateNodeExecutionDetails } from './utils';

/** Decorates a list of NodeExecutions, mapping the list items to
 * `DetailedNodeExecution`s. The node details are pulled from the the nearest
 * `ExecutionContext.dataCache`.
 */
export function useDetailedNodeExecutions(nodeExecutions: NodeExecution[]) {
    const { dataCache } = useContext(ExecutionContext);

    return useMemo(() => mapNodeExecutionDetails(nodeExecutions, dataCache), [
        nodeExecutions,
        dataCache
    ]);
}

export function useDetailedChildNodeExecutions(
    nodeExecutionGroups: NodeExecutionGroup[]
) {
    const { dataCache } = useContext(ExecutionContext);
    return useMemo(
        () =>
            nodeExecutionGroups.map(group => ({
                ...group,
                nodeExecutions: mapNodeExecutionDetails(
                    group.nodeExecutions,
                    dataCache
                )
            })),
        [nodeExecutionGroups, dataCache]
    );
}
