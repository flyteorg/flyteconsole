import { millisecondsToDuration } from 'common/utils';
import { timeStampOffset } from 'mocks/utils';
import {
    CompiledTask,
    NodeExecution,
    NodeExecutionIdentifier,
    TaskExecution,
    TaskExecutionIdentifier,
    TaskLog
} from 'models';
import { TaskExecutionPhase } from 'models/Execution/enums';
import { defaultExecutionDuration, inputUriPrefix } from './constants';
import { nodeExecutions } from './nodeExecutions';
import { tasks } from './tasks';

function makeInputUri({
    nodeExecutionId: {
        executionId: { project, domain, name },
        nodeId
    },
    retryAttempt
}: TaskExecutionIdentifier) {
    return `${inputUriPrefix}/${project}_${domain}_${name}_${nodeId}_${retryAttempt}/inputs.pb`;
}

function makeOutputUri({
    nodeExecutionId: {
        executionId: { project, domain, name },
        nodeId
    },
    retryAttempt
}: TaskExecutionIdentifier) {
    return `${inputUriPrefix}/${project}_${domain}_${name}_${nodeId}_${retryAttempt}/outputs.pb`;
}

function sampleLogs(): TaskLog[] {
    return [
        { name: 'Kubernetes Logs', uri: 'http://localhost/k8stasklog' },
        { name: 'User Logs', uri: 'http://localhost/containerlog' },
        { name: 'AWS Batch Logs', uri: 'http://localhost/awsbatchlog' },
        { name: 'Other Custom Logs', uri: 'http://localhost/customlog' }
    ];
}

function taskExecutionId(
    nodeExecution: NodeExecution,
    task: CompiledTask,
    retryAttempt = 0
) {
    return {
        retryAttempt,
        nodeExecutionId: { ...nodeExecution.id },
        taskId: { ...task.template.id }
    };
}

const pythonNodeTaskExecutionId = taskExecutionId(
    nodeExecutions.pythonNode,
    tasks.basicPython
);

const pythonNode: TaskExecution = {
    id: { ...pythonNodeTaskExecutionId },
    inputUri: makeInputUri(pythonNodeTaskExecutionId),
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
        outputUri: makeOutputUri(pythonNodeTaskExecutionId),
        logs: sampleLogs()
    }
};

const dynamicNodeTaskExecutionId = taskExecutionId(
    nodeExecutions.dynamicNode,
    tasks.dynamic
);
const dynamicNode: TaskExecution = {
    id: { ...dynamicNodeTaskExecutionId },
    inputUri: makeInputUri(dynamicNodeTaskExecutionId),
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
        outputUri: makeOutputUri(dynamicNodeTaskExecutionId),
        logs: sampleLogs()
    }
};

const dynamicChildPythonNodeTaskExecutionId = taskExecutionId(
    nodeExecutions.dynamicChildPythonNode,
    tasks.basicPython
);

const dynamicChildPythonNode: TaskExecution = {
    id: { ...dynamicChildPythonNodeTaskExecutionId },
    inputUri: makeInputUri(dynamicChildPythonNodeTaskExecutionId),
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
        outputUri: makeOutputUri(dynamicChildPythonNodeTaskExecutionId),
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
    [nodeExecutions.pythonNode.id, [pythonNode]],
    [nodeExecutions.dynamicNode.id, [dynamicNode]],
    [nodeExecutions.dynamicChildPythonNode.id, [dynamicChildPythonNode]]
];

/** Legacy dynamic tasks use the isParent flag and return child NodeExecutions
 * via a separate endpoint. This list maps child NodeExecutions to parent TaskExecutions.
 */
export const taskExecutionChildLists: [
    TaskExecutionIdentifier,
    NodeExecution[]
][] = [[taskExecutions.dynamicNode.id, [nodeExecutions.dynamicChildPythonNode]]];
