import { useQueryClient } from 'react-query';
import { NodeExecution } from '../../models/Execution/types';
import { makeNodeExecutionListQuery } from '../../queries/nodeExecutionQueries';
import { nodeExecutionQueryParams } from '../../models/Execution/constants';
import { useConditionalQuery } from './useConditionalQuery';
import { isDynamicNode, isParentNode, nodeExecutionIsTerminal } from '../Executions/utils';
import { retriesToZero } from '../flytegraph/ReactFlow/utils';

export const useNodeExecutionChildrenQuery = ({
  nodeExecution,
  enabled = true,
  refetchInterval,
}: {
  nodeExecution?: NodeExecution;
  enabled?: boolean;
  refetchInterval?: number;
}) => {
  const queryClient = useQueryClient();
  const fromUniqueParentId = nodeExecution?.id?.nodeId;
  const config = fromUniqueParentId
    ? {
        params: {
          [nodeExecutionQueryParams.parentNodeId]: fromUniqueParentId,
        },
      }
    : undefined;
  const isParent = isParentNode(nodeExecution);
  const isEnabled = isParent && !!fromUniqueParentId && enabled;
  return useConditionalQuery(
    {
      enabled: isEnabled,
      refetchInterval,
      ...makeNodeExecutionListQuery(queryClient, nodeExecution?.id.executionId!, config),
      select: (nodeExecutions) => {
        const parentScopeId = nodeExecution!.scopedId ?? nodeExecution!.metadata?.specNodeId;
        const dynamicParentNodeId = isDynamicNode(nodeExecution!)
          ? fromUniqueParentId
          : nodeExecution!.dynamicParentNodeId;

        return nodeExecutions?.map((nodeExecution) => {
          const scopedId = retriesToZero(
            nodeExecution.metadata?.specNodeId || nodeExecution?.id?.nodeId,
          );

          Object.assign(nodeExecution, {
            scopedId: `${parentScopeId}-0-${scopedId}`,
            parentScopeId,
          });
          if (dynamicParentNodeId) {
            Object.assign(nodeExecution, { dynamicParentNodeId });
          }

          return nodeExecution;
        });
      },
    },
    (prevResult) => {
      const isTerminal = prevResult.every(nodeExecutionIsTerminal);
      return !isTerminal;
    },
  );
};
