import { QueryClient } from 'react-query';
import { RequestConfig } from '@clients/common/types/adminEntityTypes';
import { QueryInput, QueryType } from '../components/data/types';
import { getTaskExecutionData, listTaskExecutions } from '../models/Execution/api';
import {
  ExecutionData,
  NodeExecutionIdentifier,
  TaskExecution,
  TaskExecutionIdentifier,
} from '../models/Execution/types';

// On successful task execution list queries, extract and store all
// executions so they are individually fetchable from the cache.
function cacheTaskExecutions(queryClient: QueryClient, taskExecutions: TaskExecution[]) {
  taskExecutions.forEach((te) => queryClient.setQueryData([QueryType.TaskExecution, te.id], te));
}

/** A query for fetching a list of `TaskExecution`s which are children of a given
 * `NodeExecution`.
 */
export function makeTaskExecutionListQuery(
  queryClient: QueryClient,
  id: NodeExecutionIdentifier,
  config?: RequestConfig,
): QueryInput<TaskExecution[]> {
  return {
    queryKey: [QueryType.TaskExecutionList, id, config],
    queryFn: async () => {
      const taskExecutions = (await listTaskExecutions(id, config)).entities;
      cacheTaskExecutions(queryClient, taskExecutions);
      queryClient.setQueryData([QueryType.TaskExecutionList, id, config], taskExecutions);
      return taskExecutions;
    },
  };
}

/** Composable fetch function which wraps `makeTaskExecutionListQuery` */
export function fetchTaskExecutionList(
  queryClient: QueryClient,
  id: NodeExecutionIdentifier,
  config?: RequestConfig,
) {
  return queryClient.fetchQuery(makeTaskExecutionListQuery(queryClient, id, config));
}
export function makeTaskExecutionDataQuery(
  queryClient: QueryClient,
  id: TaskExecutionIdentifier,
  config?: RequestConfig,
): QueryInput<ExecutionData> {
  return {
    queryKey: [QueryType.TaskExecutionData, id, config],
    queryFn: async () => {
      const taskExecutionData = await getTaskExecutionData(id, config);
      queryClient.setQueryData([QueryType.TaskExecutionData, id, config], taskExecutionData);
      return taskExecutionData;
    },
    // Task templates are immutable and safe to cache indefinitely
    staleTime: Infinity,
  };
}
