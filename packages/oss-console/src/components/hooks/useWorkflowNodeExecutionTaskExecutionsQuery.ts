import { useQueryClient } from 'react-query';
import { NodeExecution } from '../../models/Execution/types';
import { useConditionalQuery } from './useConditionalQuery';
import { makeTaskExecutionListQuery } from '../../queries/taskExecutionQueries';
import { isDynamicNode, taskExecutionIsTerminal } from '../Executions/utils';
import { WorkflowTaskExecution } from '../Executions/contexts';

/**
 *
 * @param nodeExecution The nodeExecution to fetch taskExecutions for
 * @param enabled Whether or not the query should be enabled
 * @param refetchInterval The interval at which the query should be refetched
 * @returns A list of WorkflowTaskExecution containing the dynamicParentNodeId  metadata
 */
export const useWorkflowNodeExecutionTaskExecutionsQuery = ({
  nodeExecution,
  enabled = true,
  refetchInterval,
}: {
  nodeExecution?: NodeExecution;
  enabled?: boolean;
  refetchInterval?: number;
}) => {
  const queryClient = useQueryClient();
  return useConditionalQuery<WorkflowTaskExecution[], Error, WorkflowTaskExecution[]>(
    {
      ...makeTaskExecutionListQuery(queryClient, nodeExecution?.id!),
      enabled: !!nodeExecution?.id && enabled,
      refetchInterval,
      select: (taskExecutions) => {
        const fromUniqueParentId = nodeExecution!.id.nodeId;
        const dynamicParentNodeId = isDynamicNode(nodeExecution!)
          ? fromUniqueParentId
          : nodeExecution!.dynamicParentNodeId;

        return taskExecutions?.map((taskExecution) => {
          if (dynamicParentNodeId) {
            Object.assign(taskExecution, { dynamicParentNodeId });
          }

          return taskExecution as WorkflowTaskExecution;
        });
      },
    },
    (prevResult) => {
      const isTerminal = prevResult.every(taskExecutionIsTerminal);
      return !isTerminal;
    },
  );
};
