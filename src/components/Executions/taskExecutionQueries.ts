import { QueryKey } from 'components/data/queries';
import { QueryInput } from 'components/data/types';
import {
    listTaskExecutions,
    NodeExecutionIdentifier,
    RequestConfig,
    TaskExecution
} from 'models';
import { QueryClient } from 'react-query';

// TODO: Decide if we need any of the commented queries in this file

// export function makeTaskExecutionQuery(
//     id: TaskExecutionIdentifier
// ): QueryInput<TaskExecution> {
//     return {
//         queryKey: [QueryKey.TaskExecution, id],
//         queryFn: () => getTaskExecution(id)
//     };
// }

// export function fetchTaskExecution(
//     id: TaskExecutionIdentifier,
//     queryClient: QueryClient
// ) {
//     return queryClient.fetchQuery(makeTaskExecutionQuery(id));
// }

// export function useTaskExecutionQuery(id: TaskExecutionIdentifier) {
//     return useConditionalQuery<TaskExecution>(
//         makeTaskExecutionQuery(id),
//         // todo: enabled=false since we will query it from the parent level?
//         // Maybe allow this to refresh if the parent execution is finalized but this one is not?
//         () => false
//     );
// }

export function makeTaskExecutionListQuery(
    id: NodeExecutionIdentifier,
    config?: RequestConfig
): QueryInput<TaskExecution[]> {
    return {
        queryKey: [QueryKey.TaskExecutionList, id, config],
        queryFn: async () => (await listTaskExecutions(id, config)).entities
    };
}

export function fetchTaskExecutionList(
    queryClient: QueryClient,
    id: NodeExecutionIdentifier,
    config?: RequestConfig
) {
    return queryClient.fetchQuery(makeTaskExecutionListQuery(id, config));
}

// export function useTaskExecutionListQuery(
//     id: NodeExecutionIdentifier,
//     config: RequestConfig
// ) {
//     return useConditionalQuery<TaskExecution[]>(
//         makeTaskExecutionListQuery(id, config),
//         // todo: Refresh task executions on interval while parent is non-terminal
//         () => true
//     );
// }
