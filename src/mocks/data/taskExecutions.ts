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
    retryAttempt: number = 0
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

export const taskExecutions = {
    pythonNode
};

export const taskExecutionLists: [
    NodeExecutionIdentifier,
    TaskExecution[]
][] = [[nodeExecutions.pythonNode.id, [pythonNode]]];
