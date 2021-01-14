import { DAGNode, endNodeId, startNodeId } from 'models';

export function isStartNode(node: DAGNode) {
    return node.id === startNodeId;
}

export function isEndNode(node: DAGNode) {
    return node.id === endNodeId;
}
