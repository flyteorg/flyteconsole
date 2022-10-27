import { compareTimestampsAscending } from 'common/utils';
import { QueryInput, QueryType } from 'components/data/types';
import { retriesToZero } from 'components/flytegraph/ReactFlow/utils';
import { useConditionalQuery } from 'components/hooks/useConditionalQuery';
import { isEqual } from 'lodash';
import { PaginatedEntityResponse, RequestConfig } from 'models/AdminEntity/types';
import {
  getNodeExecution,
  listNodeExecutions,
  listTaskExecutionChildren,
  listTaskExecutions,
} from 'models/Execution/api';
import { nodeExecutionQueryParams } from 'models/Execution/constants';
import {
  NodeExecution,
  NodeExecutionIdentifier,
  TaskExecution,
  TaskExecutionIdentifier,
  WorkflowExecutionIdentifier,
} from 'models/Execution/types';
import { endNodeId, startNodeId } from 'models/Node/constants';
import { QueryClient, QueryObserverResult, useQueryClient } from 'react-query';
import { executionRefreshIntervalMs } from './constants';
import { fetchTaskExecutionList } from './taskExecutionQueries';
import { formatRetryAttempt } from './TaskExecutionsList/utils';
import { NodeExecutionGroup } from './types';
import { isParentNode, nodeExecutionIsTerminal } from './utils';

const ignoredNodeIds = [startNodeId, endNodeId];
function removeSystemNodes(nodeExecutions: NodeExecution[]): NodeExecution[] {
  return nodeExecutions.filter((ne) => {
    if (ignoredNodeIds.includes(ne.id.nodeId)) {
      return false;
    }
    const specId = ne.metadata?.specNodeId;
    if (specId != null && ignoredNodeIds.includes(specId)) {
      return false;
    }
    return true;
  });
}

/** A query for fetching a single `NodeExecution` by id. */
export function makeNodeExecutionQuery(id: NodeExecutionIdentifier): QueryInput<NodeExecution> {
  return {
    queryKey: [QueryType.NodeExecution, id],
    queryFn: () => getNodeExecution(id),
  };
}

export function makeListTaskExecutionsQuery(
  id: NodeExecutionIdentifier,
): QueryInput<PaginatedEntityResponse<TaskExecution>> {
  return {
    queryKey: [QueryType.TaskExecutionList, id],
    queryFn: () => listTaskExecutions(id),
  };
}

/** Composable fetch function which wraps `makeNodeExecutionQuery` */
export function fetchNodeExecution(queryClient: QueryClient, id: NodeExecutionIdentifier) {
  return queryClient.fetchQuery(makeNodeExecutionQuery(id));
}

// On successful node execution list queries, extract and store all
// executions so they are individually fetchable from the cache.
function cacheNodeExecutions(queryClient: QueryClient, nodeExecutions: NodeExecution[]) {
  nodeExecutions.forEach((ne) => queryClient.setQueryData([QueryType.NodeExecution, ne.id], ne));
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
      const nodeExecutions = removeSystemNodes((await listNodeExecutions(id, config)).entities);
      nodeExecutions.map((exe) => {
        if (exe.metadata?.specNodeId) {
          return (exe.scopedId = retriesToZero(exe.metadata.specNodeId));
        } else {
          return (exe.scopedId = retriesToZero(exe.id.nodeId));
        }
      });
      cacheNodeExecutions(queryClient, nodeExecutions);
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

/** A query for fetching a list of `NodeExecution`s which are children of a given
 * `TaskExecution`.
 */
export function makeTaskExecutionChildListQuery(
  queryClient: QueryClient,
  id: TaskExecutionIdentifier,
  config?: RequestConfig,
): QueryInput<NodeExecution[]> {
  return {
    queryKey: [QueryType.TaskExecutionChildList, id, config],
    queryFn: async () => {
      const nodeExecutions = removeSystemNodes(
        (await listTaskExecutionChildren(id, config)).entities,
      );
      cacheNodeExecutions(queryClient, nodeExecutions);
      return nodeExecutions;
    },
    onSuccess: (nodeExecutions) => {
      nodeExecutions.forEach((ne) =>
        queryClient.setQueryData([QueryType.NodeExecution, ne.id], ne),
      );
    },
  };
}

/** Composable fetch function which wraps `makeTaskExecutionChildListQuery`. */
export function fetchTaskExecutionChildList(
  queryClient: QueryClient,
  id: TaskExecutionIdentifier,
  config?: RequestConfig,
) {
  return queryClient.fetchQuery(makeTaskExecutionChildListQuery(queryClient, id, config));
}

/** --- Queries for fetching children of a NodeExecution --- */

async function fetchGroupForTaskExecution(
  queryClient: QueryClient,
  taskExecutionId: TaskExecutionIdentifier,
  config: RequestConfig,
): Promise<NodeExecutionGroup> {
  return {
    // NodeExecutions created by a TaskExecution are grouped
    // by the retry attempt of the task.
    name: formatRetryAttempt(taskExecutionId.retryAttempt),
    nodeExecutions: await fetchTaskExecutionChildList(queryClient, taskExecutionId, config),
  };
}

async function fetchGroupForWorkflowExecution(
  queryClient: QueryClient,
  executionId: WorkflowExecutionIdentifier,
  config: RequestConfig,
): Promise<NodeExecutionGroup> {
  return {
    // NodeExecutions created by a workflow execution are grouped
    // by the execution id, since workflow executions are not retryable.
    name: executionId.name,
    nodeExecutions: await fetchNodeExecutionList(queryClient, executionId, config),
  };
}

async function fetchGroupsForTaskExecutionNode(
  queryClient: QueryClient,
  nodeExecution: NodeExecution,
  config: RequestConfig,
): Promise<NodeExecutionGroup[]> {
  const taskExecutions = await fetchTaskExecutionList(queryClient, nodeExecution.id, config);

  // For TaskExecutions marked as parents, fetch its children and create a group.
  // Otherwise, return null and we will filter it out later.
  const groups = await Promise.all(
    taskExecutions.map((execution) =>
      execution.isParent
        ? fetchGroupForTaskExecution(queryClient, execution.id, config)
        : Promise.resolve(null),
    ),
  );

  // Remove any empty groups
  return groups.filter(
    (group) => group !== null && group.nodeExecutions.length > 0,
  ) as NodeExecutionGroup[];
}

async function fetchGroupsForWorkflowExecutionNode(
  queryClient: QueryClient,
  nodeExecution: NodeExecution,
  config: RequestConfig,
): Promise<NodeExecutionGroup[]> {
  if (!nodeExecution.closure.workflowNodeMetadata) {
    throw new Error('Unexpected empty `workflowNodeMetadata`');
  }
  const { executionId } = nodeExecution.closure.workflowNodeMetadata;
  // We can only have one WorkflowExecution (no retries), so there is only
  // one group to return. But calling code expects it as an array.
  const group = await fetchGroupForWorkflowExecution(queryClient, executionId, config);
  return group.nodeExecutions.length > 0 ? [group] : [];
}

async function fetchGroupsForParentNodeExecution(
  queryClient: QueryClient,
  nodeExecution: NodeExecution,
  config: RequestConfig,
): Promise<NodeExecutionGroup[]> {
  const finalConfig = {
    ...config,
    params: {
      ...config.params,
      [nodeExecutionQueryParams.parentNodeId]: nodeExecution.id.nodeId,
    },
  };

  const parentScopeId = nodeExecution.scopedId ?? nodeExecution.metadata?.specNodeId;
  nodeExecution.scopedId = parentScopeId;

  const children = await fetchNodeExecutionList(
    queryClient,
    nodeExecution.id.executionId,
    finalConfig,
  );

  const groupsByName = children.reduce<Map<string, NodeExecutionGroup>>((out, child) => {
    const retryAttempt = formatRetryAttempt(child.metadata?.retryGroup);
    let group = out.get(retryAttempt);
    if (!group) {
      group = { name: retryAttempt, nodeExecutions: [] };
      out.set(retryAttempt, group);
    }

    /** GraphUX uses workflowClosure which uses scopedId. This builds a scopedId via parent
     *  nodeExecution to enable mapping between graph and other components     */
    let scopedId = parentScopeId;
    if (scopedId !== undefined) {
      scopedId += `-0-${child.metadata?.specNodeId}`;
      child['scopedId'] = scopedId;
    } else {
      child['scopedId'] = child.metadata?.specNodeId;
    }
    child['fromUniqueParentId'] = nodeExecution.id.nodeId;
    group.nodeExecutions.push(child);
    return out;
  }, new Map());

  return Array.from(groupsByName.values());
}

function fetchChildNodeExecutionGroups(
  queryClient: QueryClient,
  nodeExecution: NodeExecution,
  config: RequestConfig,
) {
  const { workflowNodeMetadata } = nodeExecution.closure;
  // Newer NodeExecution structures can directly indicate their parent
  // status and have their children fetched in bulk.
  if (isParentNode(nodeExecution)) {
    return fetchGroupsForParentNodeExecution(queryClient, nodeExecution, config);
  }
  // Otherwise, we need to determine the type of the node and
  // recursively fetch NodeExecutions for the corresponding Workflow
  // or Task executions.
  if (
    workflowNodeMetadata &&
    !isEqual(workflowNodeMetadata.executionId, nodeExecution.id.executionId) &&
    !isEqual(nodeExecution.metadata?.specNodeId, nodeExecution.scopedId)
  ) {
    return fetchGroupsForWorkflowExecutionNode(queryClient, nodeExecution, config);
  }
  return fetchGroupsForTaskExecutionNode(queryClient, nodeExecution, config);
}

/**
 * Query returns all children (not only direct childs) for a list of `nodeExecutions`
 */
async function fetchAllTreeNodeExecutions(
  queryClient: QueryClient,
  nodeExecutions: NodeExecution[],
  config: RequestConfig,
): Promise<NodeExecution[]> {
  const queue: NodeExecution[] = [...nodeExecutions];
  let left = 0;
  let right = queue.length;

  while (left < right) {
    const top: NodeExecution = queue[left++];
    const executionGroups: NodeExecutionGroup[] = await fetchChildNodeExecutionGroups(
      queryClient,
      top,
      config,
    );
    for (let i = 0; i < executionGroups.length; i++) {
      for (let j = 0; j < executionGroups[i].nodeExecutions.length; j++) {
        queue.push(executionGroups[i].nodeExecutions[j]);
        right++;
      }
    }
  }

  const sorted: NodeExecution[] = queue.sort((na: NodeExecution, nb: NodeExecution) => {
    if (!na.closure.startedAt) {
      return 1;
    }
    if (!nb.closure.startedAt) {
      return -1;
    }
    return compareTimestampsAscending(na.closure.startedAt, nb.closure.startedAt);
  });

  return sorted;
}

/**
 *
 * @param nodeExecutions list of parent node executionId's
 * @param config
 * @returns
 */
export function useAllTreeNodeExecutionGroupsQuery(
  nodeExecutions: NodeExecution[],
  config: RequestConfig,
): QueryObserverResult<NodeExecution[], Error> {
  const queryClient = useQueryClient();
  const shouldEnableFn = (groups) => {
    if (groups.length > 0) {
      return groups.some((group) => {
        // non-empty groups are wrapped in array
        const unwrappedGroup = Array.isArray(group) ? group[0] : group;
        if (unwrappedGroup?.nodeExecutions?.length > 0) {
          /* Return true is any executions are not yet terminal (ie, they can change) */
          return unwrappedGroup.nodeExecutions.some((ne) => {
            return !nodeExecutionIsTerminal(ne);
          });
        } else {
          return false;
        }
      });
    } else {
      return false;
    }
  };

  const n = nodeExecutions.length - 1;
  let key = '';
  if (n >= 0) {
    const keyP1 = `${nodeExecutions[0]?.scopedId}-${nodeExecutions[0].closure.phase}-${nodeExecutions[0].closure?.startedAt?.nanos}`;
    key = keyP1;
    if (n >= 1) {
      const keyP2 = `${nodeExecutions[n]?.scopedId}-${nodeExecutions[n].closure.phase}-${nodeExecutions[n].closure?.startedAt?.nanos}`;
      key = keyP1 + '-' + keyP2;
    }
  }

  return useConditionalQuery<NodeExecution[]>(
    {
      queryKey: [QueryType.NodeExecutionTreeList, key, config],
      queryFn: () => fetchAllTreeNodeExecutions(queryClient, nodeExecutions, config),
      refetchInterval: executionRefreshIntervalMs,
    },
    shouldEnableFn,
  );
}
