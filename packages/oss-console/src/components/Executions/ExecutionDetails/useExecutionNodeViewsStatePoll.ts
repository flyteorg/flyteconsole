import { useQueryClient, UseQueryResult } from 'react-query';
import { FilterOperation, SortDirection } from '@clients/common/types/adminEntityTypes';
import { useConditionalQuery } from '../../hooks/useConditionalQuery';
import { limits } from '../../../models/AdminEntity/constants';
import { executionSortFields } from '../../../models/Execution/constants';
import { Execution, NodeExecution } from '../../../models/Execution/types';
import { executionRefreshIntervalMs } from '../constants';
import { makeNodeExecutionListQuery } from '../../../queries/nodeExecutionQueries';
import { executionIsTerminal, nodeExecutionIsTerminal } from '../utils';

export interface UseExecutionNodeViewsState {
  nodeExecutionsQuery: UseQueryResult<NodeExecution[], Error>;
  nodeExecutionsRequestConfig: {
    filter: FilterOperation[];
    sort: {
      key: string;
      direction: any;
    };
    limit: number;
  };
}
const sort = {
  key: executionSortFields.createdAt,
  direction: SortDirection.ASCENDING,
};

export const hasPhaseFilter = (appliedFilters: FilterOperation[] = []) => {
  return appliedFilters.some((f) => f.key === 'phase');
};

export function useExecutionNodeViewsStatePoll(
  execution: Execution,
  filter: FilterOperation[] = [],
): UseExecutionNodeViewsState {
  const nodeExecutionsRequestConfig = {
    filter,
    sort,
    limit: limits.NONE,
  };

  const shouldEnableQuery = (executions: NodeExecution[]) => {
    const shouldEnable =
      // Guard against empty executions, if the query was made too soon after relaunching and execution
      !executions?.length ||
      !executionIsTerminal(execution) ||
      executions.some((ne) => !nodeExecutionIsTerminal(ne));
    return shouldEnable;
  };

  const nodeExecutionsQuery = useConditionalQuery(
    {
      ...makeNodeExecutionListQuery(useQueryClient(), execution.id, nodeExecutionsRequestConfig),
      refetchInterval: executionRefreshIntervalMs,
    },
    shouldEnableQuery,
  );

  return { nodeExecutionsQuery, nodeExecutionsRequestConfig };
}
