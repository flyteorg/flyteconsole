import { dNode } from '../../../../models/Graph/types';
import { isExpanded, isStartOrEndNodeId } from '../../../../models/Node/utils';

export const TimeZone = {
  Local: 'local',
  UTC: 'utc',
};

export function isTransitionNode(node: dNode) {
  // In case of branchNode childs, start and end nodes could be present as 'n0-start-node' etc.
  return isStartOrEndNodeId(node?.id);
}

export function convertToPlainNodes(nodes: dNode[], level = 0): dNode[] {
  const result: dNode[] = [];
  if (!nodes || nodes.length === 0) {
    return result;
  }
  nodes?.forEach((node) => {
    if (isTransitionNode(node)) {
      return;
    }
    result.push({ ...node, level });
    if (node?.nodes?.length > 0 && isExpanded(node)) {
      result.push(...convertToPlainNodes(node.nodes, level + 1));
    }
  });
  return result;
}
