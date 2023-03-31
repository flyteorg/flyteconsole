import { useConditionalQuery } from 'components/hooks/useConditionalQuery';
import { NodeExecution } from 'models/Execution/types';

import { useQueryClient, UseQueryResult } from 'react-query';
import { executionRefreshIntervalMs } from '../constants';
import { makeNodeExecutionQueryEnhanced } from '../nodeExecutionQueries';
import { nodeExecutionIsTerminal } from '../utils';

export const useNodeExecutionRow = (
  execution: NodeExecution,
  isInView: boolean,
): {
  nodeExecutionRowQuery: UseQueryResult<NodeExecution[], Error>;
} => {
  const shouldEnableQuery = () => {
    if (!isInView) {
      return false;
    }

    // No need for isParent check in here, the conditionalQuery
    // will gate the fetchChildExecutions call with a isParent check.
    const isTerminal = nodeExecutionIsTerminal(execution);
    return !isTerminal;
  };

  const nodeExecutionRowQuery = useConditionalQuery(
    {
      ...makeNodeExecutionQueryEnhanced(execution, useQueryClient()),
      refetchInterval: executionRefreshIntervalMs,
    },
    shouldEnableQuery,
  );

  return { nodeExecutionRowQuery };
};
