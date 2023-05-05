import { endNodeId, ignoredNodeIds, startNodeId } from './constants';

export const isStartOrEndNode = (node: any) => {
  return ignoredNodeIds.includes(node.id);
};

export function isStartNode(node: any) {
  return node.id === startNodeId;
}

export function isEndNode(node: any) {
  return node.id === endNodeId;
}

export function isExpanded(node: any) {
  return !!node.expanded;
}
