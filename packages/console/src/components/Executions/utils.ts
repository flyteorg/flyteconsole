import { durationToMilliseconds, timestampToDate } from 'common/utils';
import { cloneDeep, keyBy, merge } from 'lodash';
import {
  runningExecutionStates,
  terminalExecutionStates,
  terminalNodeExecutionStates,
  terminalTaskExecutionStates,
} from 'models/Execution/constants';
import {
  ExecutionState,
  NodeExecutionPhase,
  TaskExecutionPhase,
  WorkflowExecutionPhase,
} from 'models/Execution/enums';
import {
  BaseExecutionClosure,
  Execution,
  NodeExecution,
  TaskExecution,
} from 'models/Execution/types';
import { dNode } from 'models/Graph/types';
import { CompiledNode } from 'models/Node/types';
import { isEndNode, isExpanded, isStartNode } from 'models/Node/utils';
import { QueryClient } from 'react-query';
import {
  nodeExecutionPhaseConstants,
  taskExecutionPhaseConstants,
  taskTypeToNodeExecutionDisplayType,
  workflowExecutionPhaseConstants,
} from './constants';
import {
  SetCurrentNodeExecutionsById,
  WorkflowNodeExecution,
} from './contexts';
import { isChildGroupsFetched } from './ExecutionDetails/utils';
import { fetchChildNodeExecutionGroups } from './nodeExecutionQueries';
import {
  DynamicNodeExecution,
  ExecutionPhaseConstants,
  NodeExecutionDisplayType,
  ParentNodeExecution,
} from './types';

/** Given an execution phase, returns a set of constants (i.e. color, display
 * string) used to represent it in various UI components.
 */
export function getWorkflowExecutionPhaseConstants(
  phase: WorkflowExecutionPhase,
): ExecutionPhaseConstants {
  return (
    workflowExecutionPhaseConstants()[phase] ||
    workflowExecutionPhaseConstants()[WorkflowExecutionPhase.UNDEFINED]
  );
}

/** Given an execution phase, returns a set of constants (i.e. color, display
 * string) used to represent it in various UI components.
 */
export function getNodeExecutionPhaseConstants(
  phase: NodeExecutionPhase,
): ExecutionPhaseConstants {
  return (
    nodeExecutionPhaseConstants()[phase] ||
    nodeExecutionPhaseConstants()[NodeExecutionPhase.UNDEFINED]
  );
}

/** Given an execution phase, returns a set of constants (i.e. color, display
 * string) used to represent it in various UI components.
 */
export function getTaskExecutionPhaseConstants(
  phase: TaskExecutionPhase,
): ExecutionPhaseConstants {
  return (
    taskExecutionPhaseConstants()[phase] ||
    taskExecutionPhaseConstants()[TaskExecutionPhase.UNDEFINED]
  );
}

/**
 * Transforms taskType value to more convinient readable display Type
 */
export function getTaskDisplayType(taskType?: string): string {
  if (taskType) {
    return taskTypeToNodeExecutionDisplayType[taskType] ?? taskType;
  }

  return NodeExecutionDisplayType.Unknown;
}

/** Determines if a workflow execution can be considered finalized and will not
 * change state again.
 */
export const executionIsTerminal = (execution: Execution) =>
  execution.closure &&
  terminalExecutionStates.includes(execution.closure.phase);

/** Determines if a workflow is in a known running state. Note: "Unknown" does
 * not evaluate to true here.
 */
export const executionIsRunning = (execution: Execution) =>
  execution.closure && runningExecutionStates.includes(execution.closure.phase);

/** Determines if a node execution can be considered finalized and will not
 * change state again.
 */
export const nodeExecutionIsTerminal = (nodeExecution: NodeExecution) =>
  nodeExecution.closure &&
  terminalNodeExecutionStates.includes(nodeExecution.closure.phase);

/** Determines if a task execution can be considered finalized and will not
 * change state again.
 */
export const taskExecutionIsTerminal = (taskExecution: TaskExecution) =>
  taskExecution.closure &&
  terminalTaskExecutionStates.includes(taskExecution.closure.phase);

interface GetExecutionDurationMSArgs {
  closure: BaseExecutionClosure;
  isTerminal: boolean;
}

interface GetExecutionTimingMSResult {
  duration: number;
  queued: number;
}

/** Computes timing information for an execution based on its create/start times and duration. */
function getExecutionTimingMS({
  closure: { duration, createdAt, startedAt },
  isTerminal,
}: GetExecutionDurationMSArgs): GetExecutionTimingMSResult | null {
  if (
    (isTerminal && duration == null) ||
    createdAt == null ||
    startedAt == null
  ) {
    return null;
  }

  const createdAtDate = timestampToDate(createdAt);
  const durationMS =
    isTerminal && duration != null
      ? durationToMilliseconds(duration)
      : Date.now() - createdAtDate.getTime();
  const queuedMS =
    timestampToDate(startedAt).getTime() - createdAtDate.getTime();

  return { duration: durationMS, queued: queuedMS };
}

/** Indicates if a NodeExecution is explicitly marked as a parent node. */
export function isParentNode(
  nodeExecution: NodeExecution,
): nodeExecution is ParentNodeExecution {
  return !!nodeExecution?.metadata?.isParentNode;
}

/** Indicates if a NodeExecution is explicitly marked as a parent node. */
export function isDynamicNode(
  nodeExecution: NodeExecution,
): nodeExecution is DynamicNodeExecution {
  return !!nodeExecution?.metadata?.isDynamic;
}

export function flattenBranchNodes(node: CompiledNode): CompiledNode[] {
  const ifElse = node.branchNode?.ifElse;
  if (!ifElse) {
    return [node];
  }
  return [
    node,
    ...[
      ifElse.case?.thenNode,
      ifElse.elseNode,
      ...(ifElse.other?.map(x => x.thenNode) ?? []),
    ]
      .filter((x): x is CompiledNode => !!x)
      .flatMap(flattenBranchNodes),
  ];
}

/** Returns timing information (duration, queue time, ...) for a WorkflowExecution */
export function getWorkflowExecutionTimingMS(execution: Execution) {
  const { closure } = execution;
  const isTerminal = executionIsTerminal(execution);
  return getExecutionTimingMS({ closure, isTerminal });
}

/** Returns timing information (duration, queue time, ...) for a NodeExecution */
export function getNodeExecutionTimingMS(execution: NodeExecution) {
  const { closure } = execution;
  const isTerminal = nodeExecutionIsTerminal(execution);
  return getExecutionTimingMS({ closure, isTerminal });
}

/** Returns timing information (duration, queue time, ...) for a TaskExecution */
export function getTaskExecutionTimingMS(execution: TaskExecution) {
  const { closure } = execution;
  const isTerminal = taskExecutionIsTerminal(execution);
  return getExecutionTimingMS({ closure, isTerminal });
}

export function isExecutionArchived(execution: Execution): boolean {
  const state = execution.closure.stateChangeDetails?.state ?? null;
  return !!state && state === ExecutionState.EXECUTION_ARCHIVED;
}

/** Returns true if current node (by nodeId) has 'gateNode' field in the list of nodes on compiledWorkflowClosure */
export function isNodeGateNode(nodes: CompiledNode[], id: string): boolean {
  const node = nodes?.find(n => n.id === id);
  return !!node?.gateNode;
}

/** Transforms phase to Paused for gate nodes in the running state, otherwise returns the phase unchanged */
export function getNodeFrontendPhase(
  phase: NodeExecutionPhase,
  isGateNode: boolean,
): NodeExecutionPhase {
  return isGateNode && phase === NodeExecutionPhase.RUNNING
    ? NodeExecutionPhase.PAUSED
    : phase;
}

export function searchNode(
  nodes: dNode[],
  nodeLevel: number,
  id: string,
  scopedId: string,
  level: number,
) {
  if (!nodes || nodes.length === 0) {
    return;
  }
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (isStartNode(node) || isEndNode(node)) {
      continue;
    }
    if (node.id === id && node.scopedId === scopedId && nodeLevel === level) {
      nodes[i].expanded = !nodes[i].expanded;
      return;
    }
    if (node.nodes.length > 0 && isExpanded(node)) {
      searchNode(node.nodes, nodeLevel + 1, id, scopedId, level);
    }
  }
}

export async function fetchChildrenExecutions(
  queryClient: QueryClient,
  scopedId: string,
  nodeExecutionsById: Dictionary<WorkflowNodeExecution>,
  setCurrentNodeExecutionsById: SetCurrentNodeExecutionsById,
  skipCache = false,
) {
  const cachedParentNode = nodeExecutionsById[scopedId];
  const nodeExecutionsByIdAdapted = skipCache ? {} : nodeExecutionsById;
  if (!isChildGroupsFetched(scopedId, nodeExecutionsByIdAdapted)) {
    const childGroups = await fetchChildNodeExecutionGroups(
      queryClient,
      cachedParentNode,
      {},
    );

    let childGroupsExecutionsById;
    childGroups.forEach(group => {
      childGroupsExecutionsById = merge(
        childGroupsExecutionsById,
        keyBy(group.nodeExecutions, 'scopedId'),
      );
    });
    if (childGroupsExecutionsById) {
      const currentNodeExecutionsById = merge(
        cloneDeep(nodeExecutionsByIdAdapted),
        cloneDeep(childGroupsExecutionsById),
      );

      setCurrentNodeExecutionsById(currentNodeExecutionsById, true);
    }
  }
}
