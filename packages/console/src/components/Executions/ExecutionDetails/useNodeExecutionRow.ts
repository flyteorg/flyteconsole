import { useConditionalQuery } from 'components/hooks/useConditionalQuery';
import { NodeExecution } from 'models/Execution/types';

import { QueryClient, UseQueryResult } from 'react-query';
import { executionRefreshIntervalMs } from '../constants';
import { makeNodeExecutionQueryEnhanced } from '../nodeExecutionQueries';

export const useNodeExecutionRow = (
  queryClient: QueryClient,
  execution: NodeExecution,
  shouldEnableQuery: (data: NodeExecution[]) => boolean,
): {
  nodeExecutionRowQuery: UseQueryResult<NodeExecution[], Error>;
} => {
  const nodeExecutionRowQuery = useConditionalQuery(
    {
      ...makeNodeExecutionQueryEnhanced(execution, queryClient),
      refetchInterval: executionRefreshIntervalMs,
    },
    shouldEnableQuery,
  );

  return { nodeExecutionRowQuery };
};
