import { extractTaskTemplates } from 'components/hooks/utils';
import { NodeExecution } from 'models/Execution/types';
import { Workflow } from 'models/Workflow/types';
import { Query, QueryClient, QueryKey as ReactQueryKey } from 'react-query';
import { QueryKey } from './queries';
import { normalizeQueryKey } from './utils';

// TODO: Rename our QueryKey -> QueryType
function isQueryType(queryKey: ReactQueryKey, queryType: QueryKey) {
    return Array.isArray(queryKey) && queryKey[0] === queryType;
}

function handleWorkflowQuery(query: Query<Workflow>, queryClient: QueryClient) {
    if (query.state.status !== 'success' || query.state.data == null) {
        return;
    }

    extractTaskTemplates(query.state.data).forEach(task =>
        queryClient.setQueryData(
            // https://github.com/tannerlinsley/react-query/issues/1343
            normalizeQueryKey([QueryKey.TaskTemplate, task.id]),
            task
        )
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
        queryClient.setQueryData(
            // https://github.com/tannerlinsley/react-query/issues/1343
            normalizeQueryKey([QueryKey.NodeExecution, ne.id]),
            ne
        )
    );
}

export function attachQueryObservers(queryClient: QueryClient): QueryClient {
    queryClient.getQueryCache().subscribe(query => {
        if (!query) {
            return;
        }
        if (isQueryType(query.queryKey, QueryKey.Workflow)) {
            handleWorkflowQuery(query as Query<Workflow>, queryClient);
        }
        if (
            isQueryType(query.queryKey, QueryKey.NodeExecutionList) ||
            isQueryType(query.queryKey, QueryKey.TaskExecutionChildList)
        ) {
            handleNodeExecutionListQuery(
                query as Query<NodeExecution[]>,
                queryClient
            );
        }
    });

    return queryClient;
}
