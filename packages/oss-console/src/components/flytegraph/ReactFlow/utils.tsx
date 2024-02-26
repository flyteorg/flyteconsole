/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */

import dagre from 'dagre';
import { NodeExecutionPhase } from '../../../models/Execution/enums';
import { dNode, dTypes } from '../../../models/Graph/types';
import { RFBackgroundProps } from './types';
import { getNodeExecutionStatusClassName } from '../../utils/classes';

export const GRAPH_PADDING_FACTOR = 50;

export const DISPLAY_NAME_START = 'start';
export const DISPLAY_NAME_END = 'end';

export const ReactFlowGraphConfig = {
  customNodePrefix: 'FlyteNode',
  arrowHeadType: 'arrowClosed',
  edgeType: 'default',
};

/**
 * Function replaces all retry values with '0' to be used a key between static/runtime
 * values.
 * @param id   NodeExcution nodeId.
 * @returns    nodeId with all retry values replaces with '0'
 */
export const retriesToZero = (id: string): string => {
  const output = id.replace(/(-[0-9]-)/g, '-0-');
  return output;
};

export const graphNodePhasesList: NodeExecutionPhase[] = [
  NodeExecutionPhase.FAILED,
  NodeExecutionPhase.FAILING,
  NodeExecutionPhase.SUCCEEDED,
  NodeExecutionPhase.ABORTED,
  NodeExecutionPhase.RUNNING,
  NodeExecutionPhase.QUEUED,
  NodeExecutionPhase.PAUSED,
  NodeExecutionPhase.UNDEFINED,
];

export const isUnFetchedDynamicNode = (node: dNode) => {
  return node.isParentNode && node.nodes.length === 0;
};

export const findNodeInDag = (scopedId: string, root: dNode) => {
  if (root.scopedId === scopedId) {
    return root;
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const node of root.nodes) {
    const tmp: any = findNodeInDag(scopedId, node);
    if (tmp) {
      return tmp;
    }
  }
};

export const getGraphNodeClasses = (
  type: dTypes,
  nodeExecutionStatus?: NodeExecutionPhase,
  stillLoading: boolean = false,
) => {
  const borderClass =
    type !== dTypes.start &&
    type !== dTypes.end &&
    type !== dTypes.nestedStart &&
    type !== dTypes.nestedEnd
      ? getNodeExecutionStatusClassName('border', nodeExecutionStatus)
      : '';
  const classNames = [borderClass, 'node'];

  switch (type) {
    case dTypes.task:
      classNames.push('taskNode');
      break;
    case dTypes.branch:
      classNames.push('branchNode');
      break;
    case dTypes.subworkflow:
      classNames.push('workflowNode');
      break;
    case dTypes.start:
      classNames.push('startNode');
      break;
    case dTypes.end:
      classNames.push('endNode');
      break;
    case dTypes.nestedEnd:
      classNames.push('nestedEndNode');
      break;
    case dTypes.nestedStart:
      classNames.push('nestedStartNode');
      break;
    case dTypes.nestedMaxDepth:
      classNames.push('nestedMaxDepthNode');
      break;
    case dTypes.staticNode:
      classNames.push('staticNode');
      break;
    case dTypes.staticNestedNode:
      classNames.push('staticNestedNode');
      break;
    case dTypes.gateNode:
      classNames.push('gateNode');
      break;
    default:
      classNames.push('unknownNode');
      break;
  }

  if (stillLoading) {
    classNames.push('loading');
  }

  return classNames.join(' ');
};

export const getRFBackground = () => {
  return {
    main: {
      background: {
        border: '1px solid #444',
        backgroundColor: 'rgba(255,255,255,1)',
      },
      gridColor: 'none',
    } as RFBackgroundProps,
    nested: {
      gridColor: 'none',
    } as RFBackgroundProps,
    static: {
      background: {
        border: 'none',
        backgroundColor: 'rgb(255,255,255)',
      },
      gridColor: 'none',
    } as RFBackgroundProps,
  };
};

export interface PositionProps {
  nodes: any[];
  edges: any[];
  parentMap?: any;
  direction?: string;
}

/**
 * Computes positions for provided nodes
 * @param PositionProps
 * @returns
 */
export const computeChildNodePositions = ({ nodes, edges, direction = 'LR' }: PositionProps) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: direction,
    edgesep: 60,
    nodesep: 30,
    ranker: 'longest-path',
    acyclicer: 'greedy',
  });
  nodes.map((n) => {
    dagreGraph.setNode(n.id, n.dimensions);
  });
  edges.map((e) => {
    dagreGraph.setEdge(e.source, e.target);
  });
  dagre.layout(dagreGraph);
  const dimensions = {
    width: dagreGraph.graph().width,
    height: dagreGraph.graph().height,
  };
  const graph = nodes.map((el) => {
    const node = dagreGraph.node(el.id);
    const x = node.x - node.width / 2;
    const y = node.y - node.height / 2;
    return {
      ...el,
      position: {
        x,
        y,
      },
    };
  });
  return { graph, dimensions };
};

/**
 * Computes positions for root-level nodes in a graph by filtering out
 * all children (nodes that have parents).
 * @param PositionProps
 * @returns
 */
export const computeRootNodePositions = ({
  nodes,
  edges,
  parentMap,
  direction = 'LR',
}: PositionProps) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: direction,
    edgesep: 60,
    nodesep: 30,
    ranker: 'longest-path',
    acyclicer: 'greedy',
  });

  /* Filter all children from creating dagree nodes */
  nodes.map((n) => {
    if (n.isRootParentNode) {
      dagreGraph.setNode(n.id, {
        width: parentMap[n.id].childGraphDimensions.width,
        height: parentMap[n.id].childGraphDimensions.height,
      });
    } else if (!n.parentNode) {
      dagreGraph.setNode(n.id, n.dimensions);
    }
  });

  /* Filter all children from creating dagree edges */
  edges.map((e) => {
    if (!e.parent) {
      dagreGraph.setEdge(e.source, e.target);
    }
  });

  /* Compute graph posistions for root-level nodes */
  dagre.layout(dagreGraph);
  const dimensions = {
    width: dagreGraph.graph().width,
    height: dagreGraph.graph().height,
  };

  /* Merge dagre positions to rf elements */
  const graph = nodes.map((el) => {
    const node = dagreGraph.node(el.id);
    if (node) {
      const x = node.x - node.width / 2;
      const y = node.y - node.height / 2;
      if (parentMap && el.isRootParentNode) {
        el.style = parentMap[el.id].childGraphDimensions;
      }
      return {
        ...el,
        position: {
          x,
          y,
        },
      };
    }
    if (parentMap) {
      /* Case: Overwrite children positions with computed values */
      const parent = parentMap[el.parentNode];
      for (let i = 0; i < parent.nodes.length; i++) {
        const node = parent.nodes[i];
        if (node.id == el.id) {
          return {
            ...el,
            position: { ...node.position },
          };
        }
      }
    }
  });
  return { graph, dimensions };
};

/**
 * Returns positioned nodes and edges.
 *
 * Note: Handles nesting by first "rendering" all child graphs to calculate their rendered
 * dimensions and setting those values as the dimentions (width/height) for parent/container.
 * Once those dimensions have been set (for parent/container nodes) we can set root-level node
 * positions.
 *
 * @param nodes
 * @param edges
 * @param currentNestedView
 * @param direction
 * @returns Array of ReactFlow nodes
 */
export const getPositionedNodes = (
  nodes: any[],
  edges: any[],
  currentNestedView: any,
  direction = 'LR',
) => {
  const parentMap: any = {};
  /* (1) Collect all child graphs in parentMap */
  nodes.forEach((node) => {
    if (node.isRootParentNode) {
      parentMap[node.id] = {
        nodes: [],
        edges: [],
        childGraphDimensions: {
          width: 0,
          height: 0,
        },
        self: node,
      };
    }
    if (node.parentNode) {
      if (parentMap[node.parentNode]) {
        if (parentMap[node.parentNode].nodes) {
          parentMap[node.parentNode].nodes.push(node);
        } else {
          parentMap[node.parentNode].nodes = [node];
        }
      }
    }
  });
  edges.forEach((edge) => {
    if (edge.parent) {
      if (parentMap[edge.parent]) {
        if (parentMap[edge.parent].edges) {
          parentMap[edge.parent].edges.push(edge);
        } else {
          parentMap[edge.parent].edges = [edge];
        }
      }
    }
  });

  /* (2) Compute child graph positiions/dimensions */
  for (const parentId in parentMap) {
    const children = parentMap[parentId];
    const childGraph = computeChildNodePositions({
      nodes: children.nodes,
      edges: children.edges,
      direction,
    });
    let nestedDepth = 1;
    if (
      currentNestedView &&
      currentNestedView[parentId] &&
      currentNestedView[parentId].length > 0
    ) {
      nestedDepth = currentNestedView[parentId].length;
    }
    const borderPadding = GRAPH_PADDING_FACTOR * nestedDepth;
    const width = (childGraph?.dimensions?.width || 0) + borderPadding;
    const height = (childGraph?.dimensions?.height || 0) + borderPadding;

    parentMap[parentId].childGraphDimensions = {
      width,
      height,
    };
    const relativePosNodes = childGraph.graph.map((node) => {
      const { position } = node;
      position.y += GRAPH_PADDING_FACTOR / 2;
      position.x += GRAPH_PADDING_FACTOR / 2;
      return {
        ...node,
        position,
      };
    });
    parentMap[parentId].nodes = relativePosNodes;
    parentMap[parentId].self.dimensions.width = width;
    parentMap[parentId].self.dimensions.height = height;
  }
  /* (3) Compute positions of root-level nodes */
  const { graph, dimensions } = computeRootNodePositions({
    nodes,
    edges,
    direction,
    parentMap,
  });
  return graph;
};

export const ReactFlowIdHash = (nodes: any[], edges: any[]) => {
  const key = Math.floor(Math.random() * 10000).toString();
  const properties = ['id', 'source', 'target', 'parent', 'parentNode'];
  const hashGraph = nodes.map((node) => {
    const updates: any = {};
    properties.forEach((prop) => {
      if (node[prop]) {
        updates[prop] = `${key}-${node[prop]}`;
      }
    });
    return { ...node, ...updates };
  });

  const hashEdges = edges.map((edge) => {
    const updates: any = {};
    properties.forEach((prop) => {
      if (edge[prop]) {
        updates[prop] = `${key}-${edge[prop]}`;
      }
    });
    return { ...edge, ...updates };
  });
  return { hashGraph, hashEdges };
};
