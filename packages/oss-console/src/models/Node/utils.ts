import { dNode } from '../Graph/types';
import { endNodeId, startNodeId } from './constants';
import { CompiledNode } from './types';

export const isStartNodeId = (nodeId: string = '') => {
  return nodeId.indexOf(startNodeId) > -1;
};
export const isEndNodeId = (nodeId: string = '') => {
  return nodeId.indexOf(endNodeId) > -1;
};

export const isStartOrEndNodeId = (nodeId: string) => {
  return isStartNodeId(nodeId) || isEndNodeId(nodeId);
};

export function isStartNode(node: dNode | CompiledNode) {
  return isStartNodeId(node.id);
}

export function isEndNode(node: dNode | CompiledNode) {
  return isEndNodeId(node.id);
}

export const isStartOrEndNode = (node: dNode | CompiledNode) => {
  return isStartNode(node) || isEndNode(node);
};

export function isExpanded(node: any) {
  return !!node.expanded;
}
