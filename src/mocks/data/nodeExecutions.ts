import { millisecondsToDuration } from 'common/utils';
import { timeStampOffset } from 'mocks/utils';
import {
    NodeExecution,
    NodeExecutionIdentifier,
    WorkflowExecutionIdentifier
} from 'models';
import { NodeExecutionPhase } from 'models/Execution/enums';
import { defaultExecutionDuration, inputUriPrefix, nodeIds } from './constants';
import { workflowExecutions } from './workflowExecutions';

function makeInputUri({
    executionId: { project, domain, name },
    nodeId
}: NodeExecutionIdentifier) {
    return `${inputUriPrefix}/${project}_${domain}_${name}_${nodeId}/inputs.pb`;
}

function makeOutputUri({
    executionId: { project, domain, name },
    nodeId
}: NodeExecutionIdentifier) {
    return `${inputUriPrefix}/${project}_${domain}_${name}_${nodeId}/outputs.pb`;
}

function nodeExecutionId(
    executionId: WorkflowExecutionIdentifier,
    nodeId: string
): NodeExecutionIdentifier {
    return {
        nodeId,
        executionId: { ...executionId }
    };
}

const ids = {
    basic: {
        node1: nodeExecutionId(workflowExecutions.basic.id, 'pythonTaskNode'),
        node2: nodeExecutionId(workflowExecutions.basic.id, 'node2')
    }
};

const pythonNode: NodeExecution = {
    id: ids.basic.node1,
    metadata: {
        specNodeId: nodeIds.pythonTask
    },
    closure: {
        createdAt: timeStampOffset(
            workflowExecutions.basic.closure.createdAt,
            0
        ),
        startedAt: timeStampOffset(
            workflowExecutions.basic.closure.createdAt,
            0
        ),
        outputUri: makeOutputUri(ids.basic.node1),
        phase: NodeExecutionPhase.SUCCEEDED,
        duration: millisecondsToDuration(defaultExecutionDuration)
    },
    inputUri: makeInputUri(ids.basic.node1)
};

export const nodeExecutions = {
    pythonNode
};

export const nodeExecutionLists: [
    WorkflowExecutionIdentifier,
    NodeExecution[]
][] = [[workflowExecutions.basic.id, [pythonNode]]];
