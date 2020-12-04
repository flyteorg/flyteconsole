import { millisecondsToDuration } from 'common/utils';
import { timeStampOffset } from 'mocks/utils';
import {
    NodeExecution,
    NodeExecutionIdentifier,
    WorkflowExecutionIdentifier
} from 'models';
import { NodeExecutionPhase } from 'models/Execution/enums';
import { defaultWorkflowExecutionDuration, inputUriPrefix } from './constants';
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

const nodeIds = {
    basic: {
        node1: nodeExecutionId(workflowExecutions.basic.id, 'node1'),
        node2: nodeExecutionId(workflowExecutions.basic.id, 'node2')
    }
};

const basic1: NodeExecution = {
    id: nodeIds.basic.node1,
    closure: {
        createdAt: timeStampOffset(
            workflowExecutions.basic.closure.createdAt,
            0
        ),
        startedAt: timeStampOffset(
            workflowExecutions.basic.closure.createdAt,
            0
        ),
        outputUri: makeOutputUri(nodeIds.basic.node1),
        phase: NodeExecutionPhase.SUCCEEDED,
        duration: millisecondsToDuration(defaultWorkflowExecutionDuration / 2)
    },
    inputUri: makeInputUri(nodeIds.basic.node1)
};

const basic2: NodeExecution = {
    id: nodeIds.basic.node2,
    closure: {
        // Offset from first NodeExecution by 5 minutes
        createdAt: timeStampOffset(
            workflowExecutions.basic.closure.createdAt,
            60 * 5
        ),
        startedAt: timeStampOffset(
            workflowExecutions.basic.closure.createdAt,
            60 * 5
        ),
        outputUri: makeOutputUri(nodeIds.basic.node2),
        phase: NodeExecutionPhase.SUCCEEDED,
        duration: millisecondsToDuration(defaultWorkflowExecutionDuration / 2)
    },
    inputUri: makeInputUri(nodeIds.basic.node2)
};

export const nodeExecutions = {
    basic1,
    basic2
};

export const nodeExecutionLists: [
    WorkflowExecutionIdentifier,
    NodeExecution[]
][] = [[workflowExecutions.basic.id, [basic1, basic2]]];
