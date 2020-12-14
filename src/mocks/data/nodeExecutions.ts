import { millisecondsToDuration } from 'common/utils';
import { timeStampOffset } from 'mocks/utils';
import {
    Execution,
    NodeExecution,
    NodeExecutionClosure,
    NodeExecutionMetadata,
    WorkflowExecutionIdentifier
} from 'models';
import { NodeExecutionPhase } from 'models/Execution/enums';
import {
    defaultExecutionDuration,
    emptyInputUri,
    emptyOutputUri,
    nodeIds
} from './constants';
import {
    makeNodeExecutionInputUri,
    makeNodeExecutionOutputUri,
    nodeExecutionId
} from './utils';
import { workflowExecutionIds, workflowExecutions } from './workflowExecutions';

const ids = {
    basic: {
        node1: nodeExecutionId(workflowExecutionIds.basic, 'pythonTaskNode'),
        node2: nodeExecutionId(workflowExecutionIds.basic, 'node2')
    },
    dynamic: {
        node1: nodeExecutionId(
            workflowExecutionIds.nestedDynamic,
            'dynamicTaskNode'
        ),
        node2: nodeExecutionId(
            workflowExecutionIds.nestedDynamic,
            'dynamicTaskPythonChildNode'
        ),
        node3: nodeExecutionId(
            workflowExecutionIds.nestedDynamic,
            'pythonTaskNode'
        )
    }
};

interface NodeExecutionOverrides {
    closure?: Partial<NodeExecutionClosure>;
    metadata?: Partial<NodeExecutionMetadata>;
}

export function nodeExecution(
    parentExecution: Execution,
    nodeId: string,
    { closure, metadata }: NodeExecutionOverrides = {}
): NodeExecution {
    return {
        id: nodeExecutionId(parentExecution.id, nodeId),
        metadata: { ...metadata },
        closure: {
            createdAt: timeStampOffset(parentExecution.closure.createdAt, 0),
            startedAt: timeStampOffset(parentExecution.closure.createdAt, 0),
            outputUri: emptyOutputUri,
            phase: NodeExecutionPhase.SUCCEEDED,
            duration: millisecondsToDuration(defaultExecutionDuration),
            ...closure
        },
        inputUri: emptyInputUri
    };
}

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
        outputUri: makeNodeExecutionOutputUri(ids.basic.node1),
        phase: NodeExecutionPhase.SUCCEEDED,
        duration: millisecondsToDuration(defaultExecutionDuration)
    },
    inputUri: makeNodeExecutionInputUri(ids.basic.node1)
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
        outputUri: makeNodeExecutionOutputUri(ids.dynamic.node1),
        phase: NodeExecutionPhase.SUCCEEDED,
        duration: millisecondsToDuration(defaultExecutionDuration)
    },
    inputUri: makeNodeExecutionInputUri(ids.dynamic.node1)
};

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
        outputUri: makeNodeExecutionOutputUri(ids.dynamic.node2),
        phase: NodeExecutionPhase.SUCCEEDED,
        duration: millisecondsToDuration(defaultExecutionDuration - 3000)
    },
    inputUri: makeNodeExecutionInputUri(ids.dynamic.node2)
};

export const nodeExecutions = {
    dynamicNode,
    dynamicChildPythonNode,
    pythonNode
};

/** Maps parent WorkflowExecutions to the lists of child NodeExecutions returned for them. */
export const nodeExecutionLists: [
    WorkflowExecutionIdentifier,
    NodeExecution[]
][] = [
    [workflowExecutionIds.basic, [pythonNode]],
    [workflowExecutionIds.nestedDynamic, [dynamicNode]]
];
