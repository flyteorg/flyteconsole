import cloneDeep from 'lodash/cloneDeep';
import { QueryClient } from 'react-query';
import { RequestConfig } from '@clients/common/types/adminEntityTypes';
import { QueryInput, QueryType } from '../components/data/types';
import { retriesToZero } from '../components/flytegraph/ReactFlow/utils';
import {
  getNodeExecution,
  getNodeExecutionData,
  listNodeExecutions,
} from '../models/Execution/api';
import { nodeExecutionQueryParams } from '../models/Execution/constants';
import {
  ExecutionData,
  NodeExecution,
  NodeExecutionIdentifier,
  WorkflowExecutionIdentifier,
} from '../models/Execution/types';
import { isStartOrEndNodeId } from '../models/Node/utils';
import { WorkflowNodeExecution } from '../components/Executions/contexts';
import { isDynamicNode, isParentNode } from '../components/Executions/utils';

function removeSystemNodes(nodeExecutions: NodeExecution[]): NodeExecution[] {
  return nodeExecutions.filter((ne) => {
    if (isStartOrEndNodeId(ne.id.nodeId)) {
      return false;
    }
    const specId = ne.metadata?.specNodeId;
    if (specId != null && isStartOrEndNodeId(specId)) {
      return false;
    }
    return true;
  });
}

/**
 * A query for fetching a single `NodeExecution` by id.
 * @param id NodeExecutionIdentifier
 * @returns QueryInput<WorkflowNodeExecution>
 */
export function makeNodeExecutionQuery(
  queryClient: QueryClient,
  id: NodeExecutionIdentifier,
  config?: RequestConfig,
): QueryInput<WorkflowNodeExecution> {
  return {
    queryKey: [QueryType.NodeExecution, id, config],
    queryFn: async () => {
      const nodeExecution = await getNodeExecution(id);

      // pre-populate nodeExecution with scopedId
      const scopedId = nodeExecution.metadata?.specNodeId || nodeExecution.id.nodeId;

      Object.assign(nodeExecution, { scopedId });
      queryClient.setQueryData([QueryType.NodeExecution, id, config], nodeExecution);
      return nodeExecution;
    },
  };
}

export function makeExecutionDataQuery(
  queryClient: QueryClient,
  id: NodeExecutionIdentifier,
  config?: RequestConfig,
): QueryInput<ExecutionData> {
  return {
    queryKey: [QueryType.NodeExecutionData, id, config],
    queryFn: async () => {
      const executionData = await getNodeExecutionData(id);
      queryClient.setQueryData([QueryType.NodeExecutionData, id, config], executionData);
      return executionData;
    },
  };
}

/** A query for fetching a list of `NodeExecution`s which are children of a given
 * `Execution`.
 */
export function makeNodeExecutionListQuery(
  queryClient: QueryClient,
  id: WorkflowExecutionIdentifier,
  config?: RequestConfig,
): QueryInput<NodeExecution[]> {
  /**
   * Note on scopedId:
   * We use scopedId as a key between various UI elements built from static data
   * (eg, CompiledWorkflowClosure for the graph) that need to be mapped to runtime
   * values like nodeExecutions; rendering from a static entity has no way to know
   * the actual retry value so we use '0' for this key -- the actual value of retries
   * remains as the nodeId.
   */
  return {
    queryKey: [QueryType.NodeExecutionList, id, config],
    queryFn: async () => {
      const nodeExecutionsResult: NodeExecution[] = cloneDeep(
        (await listNodeExecutions(id, config)).entities ?? [],
      );
      const nodeExecutions = removeSystemNodes(nodeExecutionsResult);
      nodeExecutions.map((exe) => {
        const scopedId = retriesToZero(exe?.metadata?.specNodeId || exe.id.nodeId);
        Object.assign(exe, { scopedId });
        queryClient.setQueryData([QueryType.NodeExecution, exe.id], exe);
        return exe;
      });

      return nodeExecutions;
    },
  };
}

/** Composable fetch function which wraps `makeNodeExecutionListQuery`. */
export function fetchNodeExecutionList(
  queryClient: QueryClient,
  id: WorkflowExecutionIdentifier,
  config?: RequestConfig,
) {
  return queryClient.fetchQuery(makeNodeExecutionListQuery(queryClient, id, config));
}
