import { millisecondsToDuration } from 'common/utils';
import { timeStampOffset } from 'mocks/utils';
import {
    NodeExecution,
    NodeExecutionIdentifier,
    Task,
    TaskExecution,
    TaskExecutionIdentifier
} from 'models';
import { TaskExecutionPhase } from 'models/Execution/enums';
import { defaultExecutionDuration, emptyInputUri, emptyOutputUri } from './constants';
import { nodeExecutions } from './nodeExecutions';
import { tasks } from './tasks';
import {
    makeTaskExecutionInputUri,
    makeTaskExecutionOutputUri,
    sampleLogs,
    taskExecutionId
} from './utils';

const pythonNodeTaskExecutionId = taskExecutionId(
    nodeExecutions.pythonNode,
    tasks.basicPython
);

export function taskExecutionForNodeExecution(nodeExecution: NodeExecution, task: Task, retryAttempt = 0): TaskExecution {
    return {id: taskExecutionId(nodeExecution, task, retryAttempt),
    inputUri: emptyInputUri,
    isParent: false,
    closure: {
        customInfo: {},
        phase: TaskExecutionPhase.SUCCEEDED,
        duration: millisecondsToDuration(defaultExecutionDuration),
        createdAt: timeStampOffset(nodeExecution.closure.createdAt, 0),
        startedAt: timeStampOffset(nodeExecution.closure.createdAt, 0),
        outputUri: emptyOutputUri,
        logs: sampleLogs()
    }};
}

const pythonNode: TaskExecution = {
    id: { ...pythonNodeTaskExecutionId },
    inputUri: makeTaskExecutionInputUri(pythonNodeTaskExecutionId),
    isParent: false,
    closure: {
        customInfo: {},
        phase: TaskExecutionPhase.SUCCEEDED,
        duration: millisecondsToDuration(defaultExecutionDuration),
        createdAt: timeStampOffset(
            nodeExecutions.pythonNode.closure.createdAt,
            0
        ),
        startedAt: timeStampOffset(
            nodeExecutions.pythonNode.closure.createdAt,
            0
        ),
        outputUri: makeTaskExecutionOutputUri(pythonNodeTaskExecutionId),
        logs: sampleLogs()
    }
};

const dynamicNodeTaskExecutionId = taskExecutionId(
    nodeExecutions.dynamicNode,
    tasks.dynamic
);
const dynamicNode: TaskExecution = {
    id: { ...dynamicNodeTaskExecutionId },
    inputUri: makeTaskExecutionInputUri(dynamicNodeTaskExecutionId),
    isParent: true,
    closure: {
        customInfo: {},
        phase: TaskExecutionPhase.SUCCEEDED,
        duration: millisecondsToDuration(defaultExecutionDuration),
        createdAt: timeStampOffset(
            nodeExecutions.dynamicNode.closure.createdAt,
            0
        ),
        startedAt: timeStampOffset(
            nodeExecutions.dynamicNode.closure.createdAt,
            0
        ),
        outputUri: makeTaskExecutionOutputUri(dynamicNodeTaskExecutionId),
        logs: sampleLogs()
    }
};

const dynamicChildPythonNodeTaskExecutionId = taskExecutionId(
    nodeExecutions.dynamicChildPythonNode,
    tasks.basicPython
);

const dynamicChildPythonNode: TaskExecution = {
    id: { ...dynamicChildPythonNodeTaskExecutionId },
    inputUri: makeTaskExecutionInputUri(dynamicChildPythonNodeTaskExecutionId),
    isParent: false,
    closure: {
        customInfo: {},
        phase: TaskExecutionPhase.SUCCEEDED,
        duration: millisecondsToDuration(defaultExecutionDuration),
        createdAt: timeStampOffset(
            nodeExecutions.dynamicChildPythonNode.closure.createdAt,
            0
        ),
        startedAt: timeStampOffset(
            nodeExecutions.dynamicChildPythonNode.closure.createdAt,
            0
        ),
        outputUri: makeTaskExecutionOutputUri(
            dynamicChildPythonNodeTaskExecutionId
        ),
        logs: sampleLogs()
    }
};

export const taskExecutions = {
    dynamicNode,
    dynamicChildPythonNode,
    pythonNode
};

/** Maps parent NodeExecutions to the list of TaskExecutions returned for them. */
export const taskExecutionLists: [
    NodeExecutionIdentifier,
    TaskExecution[]
][] = [
    [nodeExecutions.pythonNode.id, [taskExecutions.pythonNode]],
    [nodeExecutions.dynamicNode.id, [taskExecutions.dynamicNode]],
    [
        nodeExecutions.dynamicChildPythonNode.id,
        [taskExecutions.dynamicChildPythonNode]
    ]
];

/** Legacy dynamic tasks use the isParent flag and return child NodeExecutions
 * via a separate endpoint. This list maps child NodeExecutions to parent TaskExecutions.
 */
export const taskExecutionChildLists: [
    TaskExecutionIdentifier,
    NodeExecution[]
][] = [
    [taskExecutions.dynamicNode.id, [nodeExecutions.dynamicChildPythonNode]]
];
