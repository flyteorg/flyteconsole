import { QueryKey } from 'components/data/queries';
import { QueryInput } from 'components/data/types';
import { useConditionalQuery } from 'components/hooks/useConditionalQuery';
import {
    endNodeId,
    getNodeExecution,
    listNodeExecutions,
    listTaskExecutionChildren,
    NodeExecution,
    NodeExecutionIdentifier,
    RequestConfig,
    startNodeId,
    TaskExecutionIdentifier,
    WorkflowExecutionIdentifier
} from 'models';
import { QueryClient } from 'react-query';

const ignoredNodeIds = [startNodeId, endNodeId];
function removeSystemNodes(nodeExecutions: NodeExecution[]): NodeExecution[] {
    return nodeExecutions.filter(ne => {
        if (ignoredNodeIds.includes(ne.id.nodeId)) {
            return false;
        }
        const specId = ne.metadata?.specNodeId;
        if (specId != null && ignoredNodeIds.includes(specId)) {
            return false;
        }
        return true;
    });
}

export function makeNodeExecutionQuery(
    id: NodeExecutionIdentifier
): QueryInput<NodeExecution> {
    return {
        queryKey: [QueryKey.NodeExecution, id],
        queryFn: () => getNodeExecution(id)
    };
}

export function fetchNodeExecution(
    queryClient: QueryClient,
    id: NodeExecutionIdentifier
) {
    return queryClient.fetchQuery(makeNodeExecutionQuery(id));
}

export function useNodeExecutionQuery(id: NodeExecutionIdentifier) {
    return useConditionalQuery<NodeExecution>(
        makeNodeExecutionQuery(id),
        // todo: enabled=false since we will query it from the parent level?
        // Maybe allow this to refresh if the parent execution is finalized but this one is not?
        () => false
    );
}

export function makeNodeExecutionListQuery(
    id: WorkflowExecutionIdentifier,
    config?: RequestConfig
): QueryInput<NodeExecution[]> {
    return {
        queryKey: [QueryKey.NodeExecutionList, id, config],
        queryFn: async () =>
            removeSystemNodes((await listNodeExecutions(id, config)).entities)
    };
}

export function fetchNodeExecutionList(
    queryClient: QueryClient,
    id: WorkflowExecutionIdentifier,
    config?: RequestConfig
) {
    return queryClient.fetchQuery(makeNodeExecutionListQuery(id, config));
}

export function useNodeExecutionListQuery(
    id: WorkflowExecutionIdentifier,
    config: RequestConfig
) {
    return useConditionalQuery<NodeExecution[]>(
        makeNodeExecutionListQuery(id, config),
        // todo: Refresh node executions on interval while parent is non-terminal
        () => true
    );
}

export function makeTaskExecutionChildListQuery(
    id: TaskExecutionIdentifier,
    config?: RequestConfig
): QueryInput<NodeExecution[]> {
    return {
        queryKey: [QueryKey.TaskExecutionChildList, id, config],
        queryFn: async () =>
            removeSystemNodes(
                (await listTaskExecutionChildren(id, config)).entities
            )
    };
}

export function fetchTaskExecutionChildList(
    queryClient: QueryClient,
    id: TaskExecutionIdentifier,
    config?: RequestConfig
) {
    return queryClient.fetchQuery(makeTaskExecutionChildListQuery(id, config));
}
