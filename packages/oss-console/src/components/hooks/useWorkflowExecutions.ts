import { QueryClient } from 'react-query';
import { RequestConfig } from '@clients/common/types/adminEntityTypes';
import { IdentifierScope, NameIdentifierScope } from '../../models/Common/types';
import { Execution } from '../../models/Execution/types';
import { fetchWorkflowExecutions } from '../../queries/workflowQueries';
import { usePagination } from './usePagination';

/** A hook for fetching a paginated list of workflow executions */
export function useWorkflowExecutions(
  queryClient: QueryClient,
  scope: IdentifierScope,
  config: RequestConfig,
) {
  return usePagination<Execution, IdentifierScope>(
    { ...config, cacheItems: true, fetchArg: scope },
    async (scope, config) => {
      const executions = await fetchWorkflowExecutions(
        queryClient,
        scope as NameIdentifierScope,
        config,
      );

      return executions;
    },
  );
}
