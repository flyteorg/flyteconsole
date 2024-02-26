import { useQueryClient } from 'react-query';
import { makeExecutionDataQuery } from '../../queries/nodeExecutionQueries';
import { ExecutionData, NodeExecutionIdentifier } from '../../models/Execution/types';
import { useConditionalQuery } from './useConditionalQuery';

export interface UseNodeExecutionDataQueryProps {
  id?: NodeExecutionIdentifier;
  enabled?: boolean;
  refetchInterval?: number;
  refetchCondition?: (prev: ExecutionData) => boolean;
}
/** Fetches the signed URLs for NodeExecution data (inputs/outputs) */
export function useNodeExecutionDataQuery({
  id,
  enabled = true,
  refetchInterval,
  refetchCondition = (prev) => !prev,
}: UseNodeExecutionDataQueryProps) {
  const queryClient = useQueryClient();

  const executionDataQuery = useConditionalQuery(
    {
      enabled: enabled && !!id,
      refetchInterval,
      ...makeExecutionDataQuery(queryClient, id!),
    },
    refetchCondition,
  );

  return executionDataQuery;
}
