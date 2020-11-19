import { log } from 'common/log';
import { durationToMilliseconds, timestampToDate } from 'common/utils';
import { getCacheKey } from 'components/Cache';
import {
    endNodeId,
    Identifier,
    startNodeId,
    TaskTemplate,
    TaskType
} from 'models';
import {
    BaseExecutionClosure,
    Execution,
    NodeExecution,
    runningExecutionStates,
    TaskExecution,
    terminalExecutionStates,
    terminalNodeExecutionStates,
    terminalTaskExecutionStates
} from 'models/Execution';
import {
    NodeExecutionPhase,
    TaskExecutionPhase,
    WorkflowExecutionPhase
} from 'models/Execution/enums';
import {
    nodeExecutionPhaseConstants,
    taskExecutionPhaseConstants,
    taskTypeToNodeExecutionDisplayType,
    workflowExecutionPhaseConstants
} from './constants';
import {
    DetailedNodeExecution,
    ExecutionDataCache,
    ExecutionPhaseConstants,
    NodeExecutionDisplayType,
    ParentNodeExecution
} from './types';

/** Given an execution phase, returns a set of constants (i.e. color, display
 * string) used to represent it in various UI components.
 */
export function getWorkflowExecutionPhaseConstants(
    phase: WorkflowExecutionPhase
): ExecutionPhaseConstants {
    return (
        workflowExecutionPhaseConstants[phase] ||
        workflowExecutionPhaseConstants[WorkflowExecutionPhase.UNDEFINED]
    );
}

/** Maps a `WorkflowExecutionPhase` value to a corresponding color string */
export function workflowExecutionPhaseToColor(
    phase: WorkflowExecutionPhase
): string {
    return getWorkflowExecutionPhaseConstants(phase).badgeColor;
}

/** Given an execution phase, returns a set of constants (i.e. color, display
 * string) used to represent it in various UI components.
 */
export function getNodeExecutionPhaseConstants(
    phase: NodeExecutionPhase
): ExecutionPhaseConstants {
    return (
        nodeExecutionPhaseConstants[phase] ||
        nodeExecutionPhaseConstants[NodeExecutionPhase.UNDEFINED]
    );
}

/** Maps a `NodeExecutionPhase` value to a corresponding color string */
export function nodeExecutionPhaseToColor(phase: NodeExecutionPhase): string {
    return getNodeExecutionPhaseConstants(phase).badgeColor;
}

/** Given an execution phase, returns a set of constants (i.e. color, display
 * string) used to represent it in various UI components.
 */
export function getTaskExecutionPhaseConstants(
    phase: TaskExecutionPhase
): ExecutionPhaseConstants {
    return (
        taskExecutionPhaseConstants[phase] ||
        taskExecutionPhaseConstants[TaskExecutionPhase.UNDEFINED]
    );
}

/** Maps a `TaskExecutionPhase` value to a corresponding color string */
export function taskExecutionPhaseToColor(phase: TaskExecutionPhase): string {
    return getTaskExecutionPhaseConstants(phase).badgeColor;
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
    execution.closure &&
    runningExecutionStates.includes(execution.closure.phase);

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

export function getNodeExecutionSpecId(nodeExecution: NodeExecution): string {
    return nodeExecution.metadata?.specNodeId || nodeExecution.id.nodeId;
}

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
    isTerminal
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
    nodeExecution: NodeExecution
): nodeExecution is ParentNodeExecution {
    return (
        nodeExecution.metadata != null && !!nodeExecution.metadata.isParentNode
    );
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
