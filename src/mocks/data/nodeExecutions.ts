import { millisecondsToDuration } from 'common/utils';
import { timeStampOffset } from 'mocks/utils';
import {
    NodeExecution,
    NodeExecutionIdentifier,
    WorkflowExecutionIdentifier
} from 'models';
import { NodeExecutionPhase } from 'models/Execution/enums';
import { defaultExecutionDuration, inputUriPrefix, nodeIds } from './constants';
import { workflowExecutionIds, workflowExecutions } from './workflowExecutions';

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
        node1: nodeExecutionId(workflowExecutionIds.basic, 'pythonTaskNode'),
        node2: nodeExecutionId(workflowExecutionIds.basic, 'node2')
    },
    dynamic: {
        node1: nodeExecutionId(workflowExecutionIds.nestedDynamic, 'dynamicTaskNode'),
        node2: nodeExecutionId(workflowExecutionIds.nestedDynamic, 'dynamicTaskPythonChildNode'),
        node3: nodeExecutionId(workflowExecutionIds.nestedDynamic, 'pythonTaskNode')
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

const dynamicNode: NodeExecution = {
    id: ids.dynamic.node1,
    metadata: {
        specNodeId: nodeIds.dynamicTask
    },
    closure: {
        createdAt: timeStampOffset(
            workflowExecutions.nestedDynamic.closure.createdAt,
            0
        ),
        startedAt: timeStampOffset(
            workflowExecutions.nestedDynamic.closure.createdAt,
            0
        ),
        outputUri: makeOutputUri(ids.dynamic.node1),
        phase: NodeExecutionPhase.SUCCEEDED,
        duration: millisecondsToDuration(defaultExecutionDuration)
    },
    inputUri: makeInputUri(ids.dynamic.node1)
};
// TODO: Add this to nestedDynamic WF Execution and provide task exedcutions for it or remove it
const dynamicSiblingPythonNode: NodeExecution = {
    id: ids.dynamic.node3,
    metadata: {
        specNodeId: nodeIds.pythonTask
    },
    closure: {
        createdAt: timeStampOffset(
            workflowExecutions.nestedDynamic.closure.createdAt,
            0
        ),
        startedAt: timeStampOffset(
            workflowExecutions.nestedDynamic.closure.createdAt,
            0
        ),
        outputUri: makeOutputUri(ids.dynamic.node3),
        phase: NodeExecutionPhase.SUCCEEDED,
        duration: millisecondsToDuration(defaultExecutionDuration)
    },
    inputUri: makeInputUri(ids.dynamic.node3)
};

/** This is a node execution yielded from  */
const dynamicChildPythonNode: NodeExecution = {
    id: ids.dynamic.node2,
    metadata: {
        specNodeId: nodeIds.pythonTask
    },
    closure: {
        createdAt: timeStampOffset(
            workflowExecutions.nestedDynamic.closure.createdAt,
            300
        ),
        startedAt: timeStampOffset(
            workflowExecutions.nestedDynamic.closure.createdAt,
            300
        ),
        outputUri: makeOutputUri(ids.dynamic.node2),
        phase: NodeExecutionPhase.SUCCEEDED,
        duration: millisecondsToDuration(defaultExecutionDuration - 3000)
    },
    inputUri: makeInputUri(ids.dynamic.node2)
}

export const nodeExecutions = {
    dynamicNode,
    dynamicChildPythonNode,
    dynamicSiblingPythonNode,
    pythonNode
};

/** Maps parent WorkflowExecutions to the lists of child NodeExecutions returned for them. */
export const nodeExecutionLists: [
    WorkflowExecutionIdentifier,
    NodeExecution[]
][] = [[workflowExecutionIds.basic, [pythonNode]], [workflowExecutionIds.nestedDynamic, [dynamicNode]]];
