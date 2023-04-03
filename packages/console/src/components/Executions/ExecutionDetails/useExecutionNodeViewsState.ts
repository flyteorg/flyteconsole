import { useConditionalQuery } from 'components/hooks/useConditionalQuery';
import { isEqual } from 'lodash';
import { limits } from 'models/AdminEntity/constants';
import { FilterOperation, SortDirection } from 'models/AdminEntity/types';
import { executionSortFields } from 'models/Execution/constants';
import { Execution, NodeExecution } from 'models/Execution/types';
import { useEffect, useState } from 'react';
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
      direction: any;
    };
    limit: number;
  };
}
export function useExecutionNodeViewsState(
  execution: Execution,
  filter: FilterOperation[] = [],
): UseExecutionNodeViewsState {
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
    return (
      !executionIsTerminal(execution) ||
      executions.some(ne => !nodeExecutionIsTerminal(ne))
    );
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
