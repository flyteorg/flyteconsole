import { extractTaskTemplates } from 'components/hooks/utils';
import { NodeExecution } from 'models/Execution/types';
import { Workflow } from 'models/Workflow/types';
import { QueryClient, QueryObserverOptions } from 'react-query';
import { QueryKey } from './queries';

function makeWorkflowQueryDefaults(
    queryClient: QueryClient
): QueryObserverOptions<Workflow> {
    return {
        // On successful workflow queries, extract and store all task templates
        // as individual fetchable entities.
        onSuccess: (workflow: Workflow) => {
            extractTaskTemplates(workflow).forEach(task =>
                queryClient.setQueryData([QueryKey.TaskTemplate, task.id], task)
            );
            return workflow;
        }
    };
}

function makeNodeExecutionListQueryDefaults(
    queryClient: QueryClient
): QueryObserverOptions<NodeExecution[]> {
    return {
        // On successful node execution list queries, extract and store all
        // executions so they are individually fetchable from the cache.
        onSuccess: nodeExecutions => {
            nodeExecutions.forEach(ne =>
                queryClient.setQueryData([QueryKey.NodeExecution, ne.id], ne)
            );
            return nodeExecutions;
        }
    };
}

export function attachQueryDefaults(queryClient: QueryClient): QueryClient {
    queryClient.setQueryDefaults(
        [QueryKey.Workflow],
        makeWorkflowQueryDefaults(queryClient)
    );
    queryClient.setQueryDefaults(
        [QueryKey.NodeExecutionList],
        makeNodeExecutionListQueryDefaults(queryClient)
    );
    return queryClient;
}
