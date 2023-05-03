import { QueryInput, QueryType } from 'components/data/types';
import { retriesToZero } from 'components/flytegraph/ReactFlow/utils';
import { cloneDeep, isEqual } from 'lodash';
import {
  PaginatedEntityResponse,
  RequestConfig,
} from 'models/AdminEntity/types';
import {
  getNodeExecution,
  getNodeExecutionData,
  getTaskExecutionData,
  listNodeExecutions,
  listTaskExecutionChildren,
  listTaskExecutions,
} from 'models/Execution/api';
import { nodeExecutionQueryParams } from 'models/Execution/constants';
import {
  ExternalResource,
  LogsByPhase,
  NodeExecution,
  NodeExecutionIdentifier,
  TaskExecution,
  TaskExecutionIdentifier,
  WorkflowExecutionIdentifier,
} from 'models/Execution/types';
import { ignoredNodeIds } from 'models/Node/constants';
import { isMapTaskV1 } from 'models/Task/utils';
import { QueryClient } from 'react-query';
import { getTask } from 'models';
import { createDebugLogger } from 'common/log';
import { WorkflowNodeExecution, WorkflowTaskExecution } from './contexts';
import { fetchTaskExecutionList } from './taskExecutionQueries';
import { formatRetryAttempt, getGroupedLogs } from './TaskExecutionsList/utils';
import { NodeExecutionGroup } from './types';
import { isDynamicNode, isParentNode, nodeExecutionIsTerminal } from './utils';

const debug = createDebugLogger('@nodeExecutionQueries');

function removeSystemNodes(nodeExecutions: NodeExecution[]): NodeExecution[] {
  return nodeExecutions.filter(ne => {
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
export function makeNodeExecutionQuery(
  id: NodeExecutionIdentifier,
): QueryInput<NodeExecution> {
  return {
    queryKey: [QueryType.NodeExecution, id],
    queryFn: () => getNodeExecution(id),
  };
}

/** A query for fetching a single `NodeExecution` by id. */
export function makeNodeExecutionAndTasksQuery(
  id: NodeExecutionIdentifier,
  queryClient: QueryClient,
): QueryInput<WorkflowNodeExecution> {
  return {
    queryKey: [QueryType.NodeExecutionAndTasks, id],
    queryFn: async () => {
      // step 1: Fetch the Node execution
      const nodeExecutionPure = await getNodeExecution(id);

      // step 2: Fetch the task executions and attach them to the node execution
      const workflowNodeExecution = (await getTaskExecutions(
        queryClient,
        nodeExecutionPure,
      )) as WorkflowNodeExecution;

      if (!workflowNodeExecution) {
        return {} as WorkflowNodeExecution;
      }

      workflowNodeExecution.scopedId = workflowNodeExecution?.id?.nodeId;
      // step 3: get the node executiondata
      const nodeExecutionData = await getNodeExecutionData(id);

      // step 4: get the compiled task closure
      // -- only one request is made as it is constant across all attempts
      const taskExecutions = workflowNodeExecution?.taskExecutions || [];
      const taskId = taskExecutions?.[0]?.id?.taskId;
      const compiledTaskClosure = await (taskId
        ? getTask(taskId!).catch(e => {
            debug(
              '\t failed to get compiled task closure for taskId: ',
              taskId,
              ' Error message:',
              e,
            );
          })
        : Promise.resolve(null));

      // step 5: get each task's executions data
      const tasksExecutionData = await Promise.all(
        taskExecutions?.map(te =>
          getTaskExecutionData(te.id).then(executionData => {
            const finalTask: WorkflowTaskExecution = {
              ...te,
              // append data to each task individually
              task: compiledTaskClosure!,
              taskData: executionData,
            };
            return finalTask;
          }),
        ),
      );

      return {
        ...workflowNodeExecution,
        taskExecutions: tasksExecutionData,
        nodeExecutionData,
      } as WorkflowNodeExecution;
    },
  };
}

export const getTaskExecutions = async (
  queryClient: QueryClient,
  nodeExecution: WorkflowNodeExecution,
): Promise<WorkflowNodeExecution | undefined> => {
  const isTerminal = nodeExecutionIsTerminal(nodeExecution);
  const tasksFetched = !!nodeExecution.tasksFetched;
  const isDynamic = isDynamicNode(nodeExecution);
  if (!isDynamic && tasksFetched) {
    // return null to signal no change
    return;
  }
  return await fetchTaskExecutionList(
    queryClient,
    nodeExecution.id as any,
  ).then(taskExecutions => {
    const finalTaskExecutions = cloneDeep(taskExecutions)?.map(
      taskExecution =>
        ({
          ...taskExecution,
          dynamicParentNodeId: nodeExecution.dynamicParentNodeId,
        } as WorkflowTaskExecution),
    );

    const useNewMapTaskView = finalTaskExecutions?.every(taskExecution => {
      const {
        closure: { taskType, metadata, eventVersion = 0 },
      } = taskExecution;
      return isMapTaskV1(
        eventVersion,
        metadata?.externalResources?.length ?? 0,
        taskType ?? undefined,
      );
    });

    const externalResources: ExternalResource[] = finalTaskExecutions
      .map(taskExecution => taskExecution.closure.metadata?.externalResources)
      .flat()
      .filter((resource): resource is ExternalResource => !!resource);

    const logsByPhase: LogsByPhase = getGroupedLogs(externalResources);

    const appendTasksFetched = !isDynamic || (isDynamic && isTerminal);

    return {
      ...nodeExecution,
      taskExecutions: finalTaskExecutions,
      ...(useNewMapTaskView && logsByPhase.size > 0 && { logsByPhase }),
      ...((appendTasksFetched && { tasksFetched: true }) || {}),
    } as any as WorkflowNodeExecution;
  });
};

/** A query for fetching a single `NodeExecution` by id. */
export function makeNodeExecutionQueryEnhanced(
  nodeExecution: WorkflowNodeExecution,
  queryClient: QueryClient,
): QueryInput<WorkflowNodeExecution[]> {
  const { id } = nodeExecution || {};

  return {
    enabled: !!id,
    queryKey: [QueryType.NodeExecutionEnhanced, id],
    queryFn: async () => {
      // complexity:
      // +1 for parent node tasks
      // +1 for node execution list
      // +n= executionList.length
      const parentExecution = cloneDeep(nodeExecution);
      const isParent = isParentNode(parentExecution);
      const fromUniqueParentId = parentExecution.id.nodeId;
      const parentScopeId =
        parentExecution.scopedId ?? parentExecution.metadata?.specNodeId;
      parentExecution.scopedId = parentScopeId;
      const dynamicParentNodeId = isDynamicNode(parentExecution)
        ? fromUniqueParentId
        : parentExecution.dynamicParentNodeId;

      // if the node is a parent, force refetch its children
      // called by NodeExecutionDynamicProvider
      const parentNodeExecutions = isParent
        ? () =>
            fetchNodeExecutionList(
              // requests listNodeExecutions
              queryClient,
              id.executionId,
              {
                params: {
                  [nodeExecutionQueryParams.parentNodeId]: fromUniqueParentId,
                },
              },
            ).then(childExecutions => {
              const children = childExecutions.map(e => {
                const scopedId = e.metadata?.specNodeId
                  ? retriesToZero(e?.metadata?.specNodeId)
                  : retriesToZero(e?.id?.nodeId);

                return {
                  ...e,
                  scopedId: `${parentScopeId}-0-${scopedId}`,
                  fromUniqueParentId,
                  dynamicParentNodeId,
                };
              });
              return children;
            })
        : () => Promise.resolve([]);

      const parentNodeAndTaskExecutions = await Promise.all([
        getTaskExecutions(queryClient, parentExecution),
        parentNodeExecutions(),
      ]).then(([parent, children]) => {
        // strip closure and metadata to avoid overwriting data from queries that handle status updates
        const {
          closure: _,
          metadata: __,
          ...parentLight
        } = parent || ({} as WorkflowNodeExecution);
        return [parentLight, ...children].filter(n => !!n);
      });

      return parentNodeAndTaskExecutions as NodeExecution[];
    },
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
export function fetchNodeExecution(
  queryClient: QueryClient,
  id: NodeExecutionIdentifier,
) {
  return queryClient.fetchQuery(makeNodeExecutionQuery(id));
}

// On successful node execution list queries, extract and store all
// executions so they are individually fetchable from the cache.
function cacheNodeExecutions(
  queryClient: QueryClient,
  nodeExecutions: NodeExecution[],
) {
  nodeExecutions.forEach(ne =>
    queryClient.setQueryData([QueryType.NodeExecution, ne.id], ne),
  );
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
      const promise = (await listNodeExecutions(id, config)).entities;
      const nodeExecutions = removeSystemNodes(promise);
      nodeExecutions.map(exe => {
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
  return queryClient.fetchQuery(
    makeNodeExecutionListQuery(queryClient, id, config),
  );
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
    onSuccess: nodeExecutions => {
      nodeExecutions.forEach(ne =>
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
  return queryClient.fetchQuery(
    makeTaskExecutionChildListQuery(queryClient, id, config),
  );
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
    nodeExecutions: await fetchTaskExecutionChildList(
      queryClient,
      taskExecutionId,
      config,
    ),
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
    nodeExecutions: await fetchNodeExecutionList(
      queryClient,
      executionId,
      config,
    ),
  };
}

async function fetchGroupsForTaskExecutionNode(
  queryClient: QueryClient,
  nodeExecution: NodeExecution,
  config: RequestConfig,
): Promise<NodeExecutionGroup[]> {
  const taskExecutions = await fetchTaskExecutionList(
    queryClient,
    nodeExecution.id,
    config,
  );

  // For TaskExecutions marked as parents, fetch its children and create a group.
  // Otherwise, return null and we will filter it out later.
  const groups = await Promise.all(
    taskExecutions.map(execution =>
      execution.isParent
        ? fetchGroupForTaskExecution(queryClient, execution.id, config)
        : Promise.resolve(null),
    ),
  );

  // Remove any empty groups
  return groups.filter(
    group => group !== null && group.nodeExecutions.length > 0,
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
  const group = await fetchGroupForWorkflowExecution(
    queryClient,
    executionId,
    config,
  );
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

  const parentScopeId =
    nodeExecution.scopedId ?? nodeExecution.metadata?.specNodeId;
  nodeExecution.scopedId = parentScopeId;

  const children = await fetchNodeExecutionList(
    queryClient,
    nodeExecution.id.executionId,
    finalConfig,
  );

  const groupsByName = children.reduce<Map<string, NodeExecutionGroup>>(
    (out, child) => {
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
    },
    new Map(),
  );

  return Array.from(groupsByName.values());
}

export function fetchChildNodeExecutionGroups(
  queryClient: QueryClient,
  nodeExecution: NodeExecution,
  config: RequestConfig,
) {
  const { workflowNodeMetadata } = nodeExecution.closure;
  // Newer NodeExecution structures can directly indicate their parent
  // status and have their children fetched in bulk.
  if (isParentNode(nodeExecution)) {
    return fetchGroupsForParentNodeExecution(
      queryClient,
      nodeExecution,
      config,
    );
  }
  // Otherwise, we need to determine the type of the node and
  // recursively fetch NodeExecutions for the corresponding Workflow
  // or Task executions.
  if (
    workflowNodeMetadata &&
    !isEqual(workflowNodeMetadata.executionId, nodeExecution.id.executionId) &&
    !isEqual(nodeExecution.metadata?.specNodeId, nodeExecution.scopedId)
  ) {
    return fetchGroupsForWorkflowExecutionNode(
      queryClient,
      nodeExecution,
      config,
    );
  }
  return fetchGroupsForTaskExecutionNode(queryClient, nodeExecution, config);
}
