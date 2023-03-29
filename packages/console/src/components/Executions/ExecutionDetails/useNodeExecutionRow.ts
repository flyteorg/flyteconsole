import { useConditionalQuery } from 'components/hooks/useConditionalQuery';
import { NodeExecution } from 'models/Execution/types';

import { useQueryClient, UseQueryResult } from 'react-query';
import { executionRefreshIntervalMs } from '../constants';
import { makeNodeExecutionQuery2 } from '../nodeExecutionQueries';
import { nodeExecutionIsTerminal } from '../utils';

export const useNodeExecutionRow = (
  execution: NodeExecution,
  shouldRun: boolean = false,
): {
  nodeExecutionRowQuery: UseQueryResult<NodeExecution, Error>;
} => {
  const shouldEnableQuery = () => {
    if (!shouldRun) {
      return false;
    }
    const isTerminal = nodeExecutionIsTerminal(execution);
    return !isTerminal;
  };

  const nodeExecutionRowQuery = useConditionalQuery(
    {
      ...makeNodeExecutionQuery2(execution.id, useQueryClient()),
      refetchInterval: executionRefreshIntervalMs,
    },
    shouldEnableQuery,
  );

  return { nodeExecutionRowQuery };
};
