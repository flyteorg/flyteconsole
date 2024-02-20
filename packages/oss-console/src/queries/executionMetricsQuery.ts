import { RequestConfig } from '@clients/common/types/adminEntityTypes';
import { QueryClient } from 'react-query';
import { QueryInput, QueryType } from '../components/data/types';
import { createDebugLogger } from '../common/log';
import {
  WorkflowExecutionGetMetricsResponse,
  WorkflowExecutionIdentifier,
} from '../models/Execution/types';
import { getExecutionMetrics } from '../models/Execution/api';

const debug = createDebugLogger('@executionMetricsQuery');

/**
 * A query for fetching project domain attributes.
 * @param queryClient The react-query client
 * @param id The WorkflowExecutionIdentifier
 * @param config The request config
 * @returns
 */
export function makeExecutionMetricsQuery(
  queryClient: QueryClient,
  id: WorkflowExecutionIdentifier,
  config?: RequestConfig,
): QueryInput<WorkflowExecutionGetMetricsResponse> {
  return {
    queryKey: [QueryType.ExecutionMetrics, id, config],
    queryFn: async () => {
      try {
        const projectDomainAttributes = await getExecutionMetrics(id, config);

        queryClient.setQueryData([QueryType.ExecutionMetrics, id, config], projectDomainAttributes);

        return projectDomainAttributes;
      } catch (error) {
        debug('makeProjectDomainAttributesQuery error', error);
      }

      return {} as WorkflowExecutionGetMetricsResponse;
    },
    // `LaunchPlan` objects (individual versions) are immutable and safe to
    // cache indefinitely once retrieved in full
    staleTime: Infinity,
  };
}
