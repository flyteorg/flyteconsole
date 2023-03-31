import { useConditionalQuery } from 'components/hooks/useConditionalQuery';
import { NodeExecution } from 'models/Execution/types';

import { useQueryClient, UseQueryResult } from 'react-query';
import { executionRefreshIntervalMs } from '../constants';
import { makeNodeExecutionQueryEnhanced } from '../nodeExecutionQueries';
import { isParentNode, nodeExecutionIsTerminal } from '../utils';

export const useNodeExecutionRow = (
  execution: NodeExecution,
  isInView: boolean,
  parentNodeCallback: (nodeExecution: NodeExecution) => void,
): {
  nodeExecutionRowQuery: UseQueryResult<NodeExecution, Error>;
} => {
  const shouldEnableQuery = () => {
    if (!isInView) {
      return false;
    }
    const isTerminal = nodeExecutionIsTerminal(execution);
    // const isParent = isParentNode(execution);
    return !isTerminal;
    // return !isTerminal && isParent;
  };

  const nodeExecutionRowQuery = useConditionalQuery(
    {
      ...makeNodeExecutionQueryEnhanced(execution.id, useQueryClient()),
      onSettled: async nodeExecution => {
        await parentNodeCallback(nodeExecution!);
      },
      refetchInterval: executionRefreshIntervalMs,
    },
    shouldEnableQuery,
  );

  return { nodeExecutionRowQuery };
};
