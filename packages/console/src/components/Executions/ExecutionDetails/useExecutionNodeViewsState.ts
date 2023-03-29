import { useConditionalQuery } from 'components/hooks/useConditionalQuery';
import { limits } from 'models/AdminEntity/constants';
import { FilterOperation, SortDirection } from 'models/AdminEntity/types';
import { executionSortFields } from 'models/Execution/constants';
import { Execution, NodeExecution } from 'models/Execution/types';
import { useQueryClient } from 'react-query';
import { executionRefreshIntervalMs } from '../constants';
import { makeNodeExecutionListQuery } from '../nodeExecutionQueries';
import { executionIsTerminal, nodeExecutionIsTerminal } from '../utils';

export function useExecutionNodeViewsState(
  execution: Execution,
  filter: FilterOperation[] = [],
): {
  nodeExecutionsQuery: any;
  nodeExecutionsRequestConfig: {
    filter: FilterOperation[];
    sort: {
      key: string;
      direction: any;
    };
    limit: number;
  };
} {
  const sort = {
    key: executionSortFields.createdAt,
    direction: SortDirection.ASCENDING,
  };
  const nodeExecutionsRequestConfig = {
    filter,
    sort,
    limit: limits.NONE,
  };

  const shouldEnableQuery = (executions: NodeExecution[]) => {
    const isTerminal = executionIsTerminal(execution);
    return !isTerminal || executions.some(ne => !nodeExecutionIsTerminal(ne));
  };

  const nodeExecutionsQuery = useConditionalQuery(
    {
      ...makeNodeExecutionListQuery(
        useQueryClient(),
        execution.id,
        nodeExecutionsRequestConfig,
      ),
      refetchInterval: executionRefreshIntervalMs,
    },
    shouldEnableQuery,
  );
  return { nodeExecutionsQuery, nodeExecutionsRequestConfig };
}
