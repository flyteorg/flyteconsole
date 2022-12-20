import { dEdge, dNode, dTypes } from 'models/Graph/types';
import { Edge, Node, Position } from 'react-flow-renderer';
import { CatalogCacheStatus, NodeExecutionPhase, TaskExecutionPhase } from 'models/Execution/enums';
import { createDebugLogger } from 'common/log';
import { LogsByPhase } from 'models/Execution/types';
import { isMapTaskType } from 'models/Task/utils';
import { ReactFlowGraphConfig } from './utils';
import { ConvertDagProps } from './types';

interface rfNode extends Node {
  isRootParentNode?: boolean;
}

interface rfEdge extends Edge {
  parent?: string;
}

interface ReactFlowGraph {
  nodes: any;
  edges: any;
}

const debug = createDebugLogger('@TransformerDAGToReactFlow');

export interface ReactFlowGraphMapping {
  root: ReactFlowGraph;
  rootParentMap: {
    [key: string]: {
      [key: string]: ReactFlowGraph;
    };
  };
}

export const buildCustomNodeName = (type: dTypes) => {
  return `${ReactFlowGraphConfig.customNodePrefix}_${dTypes[type]}`;
};

export const nodeHasChildren = (node: dNode) => {
  return node.nodes.length > 0;
};

export const isStartOrEndEdge = (edge) => {
  return edge.sourceId === 'start-node' || edge.targetId === 'end-node';
};

interface BuildDataProps {
  node: dNode;
  nodeExecutionsById: any;
  onNodeSelectionChanged: any;
  onPhaseSelectionChanged: (phase: TaskExecutionPhase) => void;
  selectedPhase: TaskExecutionPhase;
  onAddNestedView: any;
  onRemoveNestedView: any;
  rootParentNode: dNode;
  currentNestedView: string[];
}
const buildReactFlowDataProps = (props: BuildDataProps) => {
  const {
    node,
    nodeExecutionsById,
    onNodeSelectionChanged,
    onPhaseSelectionChanged,
    selectedPhase,
    onAddNestedView,
    onRemoveNestedView,
    rootParentNode,
    currentNestedView,
  } = props;

  const { value: nodeValue, name: displayName, scopedId, type: nodeType } = node;
  const taskType = nodeValue?.template?.type ?? null;

  const mapNodeExecutionStatus = () => {
    if (nodeExecutionsById) {
      if (nodeExecutionsById[scopedId]) {
        return nodeExecutionsById[scopedId].closure.phase as NodeExecutionPhase;
      } else {
        return NodeExecutionPhase.SKIPPED;
      }
    } else {
      return NodeExecutionPhase.UNDEFINED;
    }
  };
  const nodeExecutionStatus = mapNodeExecutionStatus();

  const nodeLogsByPhase: LogsByPhase = nodeExecutionsById?.[node.scopedId]?.logsByPhase;

  // get the cache status for mapped task
  const isMapCache = isMapTaskType(taskType) && nodeValue?.template?.metadata?.cacheSerializable;

  const cacheStatus: CatalogCacheStatus = isMapCache
    ? CatalogCacheStatus.MAP_CACHE
    : nodeExecutionsById?.[scopedId]?.closure.taskNodeMetadata?.cacheStatus;

  const dataProps = {
    nodeExecutionStatus,
    text: displayName,
    handles: [],
    nodeType,
    scopedId,
    taskType,
    nodeLogsByPhase,
    cacheStatus,
    selectedPhase,
    onNodeSelectionChanged: () => {
      if (onNodeSelectionChanged) {
        onNodeSelectionChanged([scopedId]);
      }
    },
    onPhaseSelectionChanged: (phase: TaskExecutionPhase) => {
      if (onPhaseSelectionChanged) {
        onPhaseSelectionChanged(phase);
      }
    },
    onAddNestedView: () => {
      onAddNestedView({
        parent: rootParentNode.scopedId,
        view: scopedId,
      });
    },
    onRemoveNestedView,
  };

  for (const rootParentId in currentNestedView) {
    if (scopedId === rootParentId) {
      dataProps['currentNestedView'] = currentNestedView[rootParentId];
    }
  }

  return dataProps;
};

interface BuildNodeProps {
  node: dNode;
  dataProps: any;
  rootParentNode?: dNode;
  parentNode?: dNode;
  typeOverride?: dTypes;
}
const buildReactFlowNode = ({
  node,
  dataProps,
  rootParentNode,
  parentNode,
  typeOverride,
}: BuildNodeProps): rfNode => {
  const output: rfNode = {
    id: node.scopedId,
    type: buildCustomNodeName(typeOverride || node.type),
    data: { text: node.scopedId },
    position: { x: 0, y: 0 },
    style: {},
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  };
  if (rootParentNode) {
    output['parentNode'] = rootParentNode.scopedId;
  } else if (parentNode) {
    output['parentNode'] = parentNode.scopedId;
  }

  if (output.parentNode === node.scopedId) {
    delete output.parentNode;
  }

  output['data'] = buildReactFlowDataProps({
    ...dataProps,
    node,
    rootParentNode,
  });
  return output;
};
interface BuildEdgeProps {
  edge: dEdge;
  rootParentNode?: dNode;
  parentNode?: dNode;
}
export const buildReactFlowEdge = ({ edge, rootParentNode }: BuildEdgeProps): rfEdge => {
  const output = {
    id: `${edge.sourceId}->${edge.targetId}`,
    source: edge.sourceId,
    target: edge.targetId,
    arrowHeadType: ReactFlowGraphConfig.arrowHeadType,
    type: ReactFlowGraphConfig.edgeType,
  } as rfEdge;

  if (rootParentNode) {
    output['parent'] = rootParentNode.scopedId;
    output['zIndex'] = 1;
  }

  return output;
};

export const edgesToArray = (edges) => {
  return Object.values(edges);
};

export const nodesToArray = (nodes) => {
  return Object.values(nodes);
};

export const buildGraphMapping = (props): ReactFlowGraphMapping => {
  const dag: dNode = props.root;
  const {
    nodeExecutionsById,
    onNodeSelectionChanged,
    onPhaseSelectionChanged,
    selectedPhase,
    onAddNestedView,
    onRemoveNestedView,
    currentNestedView,
    isStaticGraph,
  } = props;
  const nodeDataProps = {
    nodeExecutionsById,
    onNodeSelectionChanged,
    onPhaseSelectionChanged,
    selectedPhase,
    onAddNestedView,
    onRemoveNestedView,
    currentNestedView,
  };
  const root: ReactFlowGraph = {
    nodes: {},
    edges: {},
  };
  const rootParentMap = {};

  interface ParseProps {
    nodeDataProps: any;
    contextNode: dNode;
    contextParent?: dNode;
    rootParentNode?: dNode;
  }
  const parse = (props: ParseProps) => {
    const { contextNode, contextParent, rootParentNode, nodeDataProps } = props;
    let context: ReactFlowGraph | null = null;
    if (!contextNode) {
      debug('\t graph parse: contextNode is ', contextNode);
      return;
    }

    contextNode.nodes
      .filter((n) => !!n)
      .map((node: dNode) => {
        /* Case: node has children => recurse */
        if (nodeHasChildren(node)) {
          if (rootParentNode) {
            parse({
              contextNode: node,
              contextParent: node,
              rootParentNode: rootParentNode,
              nodeDataProps: nodeDataProps,
            });
          } else {
            parse({
              contextNode: node,
              contextParent: node,
              rootParentNode: node,
              nodeDataProps: nodeDataProps,
            });
          }
        }

        if (rootParentNode) {
          const rootParentId = rootParentNode.scopedId;
          const contextParentId = contextParent?.scopedId;
          rootParentMap[rootParentId] = rootParentMap[rootParentId] || {};
          rootParentMap[rootParentId][contextParentId] = rootParentMap[rootParentId][
            contextParentId
          ] || {
            nodes: {},
            edges: {},
          };
          context = rootParentMap[rootParentId][contextParentId] as ReactFlowGraph;
          const reactFlowNode = buildReactFlowNode({
            node: node,
            dataProps: nodeDataProps,
            rootParentNode: rootParentNode,
            parentNode: contextParent,
            typeOverride: isStaticGraph === true ? dTypes.staticNode : undefined,
          });
          context.nodes[reactFlowNode.id] = reactFlowNode;
        } else {
          const reactFlowNode = buildReactFlowNode({
            node: node,
            dataProps: nodeDataProps,
            typeOverride: isStaticGraph === true ? dTypes.staticNode : undefined,
          });
          root.nodes[reactFlowNode.id] = reactFlowNode;
        }
      });
    contextNode.edges.map((edge: dEdge) => {
      const reactFlowEdge = buildReactFlowEdge({ edge, rootParentNode });
      if (rootParentNode && context) {
        context.edges[reactFlowEdge.id] = reactFlowEdge;
      } else {
        root.edges[reactFlowEdge.id] = reactFlowEdge;
      }
    });
  };

  parse({ contextNode: dag, nodeDataProps: nodeDataProps });

  return {
    root,
    rootParentMap,
  };
};

export interface RenderGraphProps {
  graphMapping: any;
  currentNestedView?: any[];
  maxRenderDepth?: number;
  isStaticGraph?: boolean;
}
export const renderGraph = ({
  graphMapping,
  currentNestedView,
  maxRenderDepth = 0,
  isStaticGraph = false,
}) => {
  debug('\t graphMapping:', graphMapping);
  debug('\t currentNestedView:', currentNestedView);
  if (maxRenderDepth > 0 && !isStaticGraph) {
    const nestedChildGraphs: ReactFlowGraph = {
      nodes: {},
      edges: {},
    };
    const nestedContent: string[] = [];

    /**
     * Compute which nested content will be populated into a subworkflow container.
     *
     * Function returns array of id's. These id's are then matched to rootParentMap
     * values for determining which nodes to show
     *
     * Note: currentNestedView is a mapping where
     *  k: rootParentId
     *  v: array of nested depth with last value as current view
     */
    for (const nestedParentId in graphMapping.rootParentMap) {
      const rootParent = currentNestedView[nestedParentId];
      if (rootParent) {
        const currentView = rootParent[rootParent.length - 1];
        nestedContent.push(currentView);
      } else {
        nestedContent.push(nestedParentId);
      }
    }

    for (const rootParentId in graphMapping.rootParentMap) {
      const parentMapContext = graphMapping.rootParentMap[rootParentId];
      for (let i = 0; i < nestedContent.length; i++) {
        const nestedChildGraphId = nestedContent[i];
        if (parentMapContext[nestedChildGraphId]) {
          nestedChildGraphs.nodes = {
            ...nestedChildGraphs.nodes,
            ...parentMapContext[nestedChildGraphId].nodes,
          };
          nestedChildGraphs.edges = {
            ...nestedChildGraphs.edges,
            ...parentMapContext[nestedChildGraphId].edges,
          };
        }
      }
      for (const parentKey in graphMapping.root.nodes) {
        const parentNode = graphMapping.root.nodes[parentKey];
        if (parentNode.id == rootParentId) {
          parentNode['isRootParentNode'] = true;
          parentNode['style'] = {};
        }
      }
      /**
       *  @TODO refactor this; we need this step but can prob be done better
       *  The issue is that somehow/somewhere root-level nodes are being added
       *  to these nestedGraphs and if the appear in the output they break
       *  reactFlow because a node can have a self-referencing "parentNode"
       *
       *  eg. { id: "n0", parentNode: "n0"} will break
       *
       */
      for (const nodeId in nestedChildGraphs.nodes) {
        const node = nestedChildGraphs.nodes[nodeId];
        for (const rootId in graphMapping.rootParentMap) {
          if (node.id == rootId) {
            delete nestedChildGraphs.nodes[nodeId];
          } else {
            if (node.type == 'FlyteNode_subworkflow') {
              node.type = 'FlyteNode_nestedMaxDepth';
            }
          }
        }
      }
    }
    const output = { ...graphMapping.root };
    output.nodes = { ...output.nodes, ...nestedChildGraphs.nodes };
    output.edges = { ...output.edges, ...nestedChildGraphs.edges };
    output.nodes = nodesToArray(output.nodes);
    output.edges = edgesToArray(output.edges);
    return output;
  } else {
    const output = { ...graphMapping.root };
    output.nodes = nodesToArray(output.nodes);
    output.edges = edgesToArray(output.edges);
    return output;
  }
};

export const ConvertFlyteDagToReactFlows = (props: ConvertDagProps) => {
  const graphMapping: ReactFlowGraphMapping = buildGraphMapping(props);
  return renderGraph({
    graphMapping: graphMapping,
    currentNestedView: props.currentNestedView,
    maxRenderDepth: props.maxRenderDepth,
    isStaticGraph: props.isStaticGraph,
  });
};
