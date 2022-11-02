import { useConditionalQuery } from 'components/hooks/useConditionalQuery';
import {
  limits,
  Execution,
  NodeExecution,
  FilterOperation,
  SortDirection,
} from '@flyteconsole/components';
import { executionSortFields } from 'models/Execution/constants';
import { useQueryClient, UseQueryResult } from 'react-query';
import { executionRefreshIntervalMs } from '../constants';
import { makeNodeExecutionListQuery } from '../nodeExecutionQueries';
import { executionIsTerminal, nodeExecutionIsTerminal } from '../utils';

export interface UseExecutionNodeViewsState {
  nodeExecutionsQuery: UseQueryResult<NodeExecution[], Error>;
  nodeExecutionsRequestConfig: {
    filter: FilterOperation[];
    sort: {
      key: string;
      direction: SortDirection;
    };
    limit: number;
  };
}
// @ts-ignore
export const useExecutionNodeViewsState: (
  execution: Execution,
  filter?: FilterOperation[],
) => UseExecutionNodeViewsState = (
  execution: Execution,
  filter: FilterOperation[] = [],
): UseExecutionNodeViewsState => {
  const sort = {
    key: executionSortFields.createdAt,
    direction: SortDirection.ASCENDING,
  };
  const nodeExecutionsRequestConfig = {
    filter,
    sort,
    limit: limits.NONE,
  };

  const shouldEnableQuery = (executions: NodeExecution[]) =>
    !executionIsTerminal(execution) || executions.some((ne) => !nodeExecutionIsTerminal(ne));

  const nodeExecutionsQuery = useConditionalQuery(
    {
      ...makeNodeExecutionListQuery(useQueryClient(), execution.id, nodeExecutionsRequestConfig),
      refetchInterval: executionRefreshIntervalMs,
    },
    shouldEnableQuery,
  );

  return { nodeExecutionsQuery, nodeExecutionsRequestConfig };
};
