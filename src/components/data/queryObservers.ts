import { extractTaskTemplates } from 'components/hooks/utils';
import { NodeExecution } from 'models/Execution/types';
import { Workflow } from 'models/Workflow/types';
import { Query, QueryClient, QueryKey } from 'react-query';
import { QueryType } from './queries';

function isQueryType(queryKey: QueryKey, queryType: QueryType) {
    return Array.isArray(queryKey) && queryKey[0] === queryType;
}

function handleWorkflowQuery(query: Query<Workflow>, queryClient: QueryClient) {
    if (query.state.status !== 'success' || query.state.data == null) {
        return;
    }

    extractTaskTemplates(query.state.data).forEach(task =>
        queryClient.setQueryData([QueryType.TaskTemplate, task.id], task)
    );
}

function handleNodeExecutionListQuery(
    query: Query<NodeExecution[]>,
    queryClient: QueryClient
) {
    if (query.state.status !== 'success' || query.state.data == null) {
        return;
    }

    // On successful node execution list queries, extract and store all
    // executions so they are individually fetchable from the cache.
    query.state.data.forEach(ne =>
        queryClient.setQueryData([QueryType.NodeExecution, ne.id], ne)
    );
}

export function attachQueryObservers(queryClient: QueryClient): QueryClient {
    queryClient.getQueryCache().subscribe(query => {
        if (!query) {
            return;
        }
        if (isQueryType(query.queryKey, QueryType.Workflow)) {
            handleWorkflowQuery(query as Query<Workflow>, queryClient);
        }
        if (
            isQueryType(query.queryKey, QueryType.NodeExecutionList) ||
            isQueryType(query.queryKey, QueryType.TaskExecutionChildList)
        ) {
            handleNodeExecutionListQuery(
                query as Query<NodeExecution[]>,
                queryClient
            );
        }
    });

    return queryClient;
}
