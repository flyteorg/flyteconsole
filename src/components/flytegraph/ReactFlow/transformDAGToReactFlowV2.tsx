import { dEdge, dNode, dTypes } from 'models/Graph/types';
import { ReactFlowGraphConfig } from './utils';
import { Edge, Node, Position } from 'react-flow-renderer';
import { NodeExecutionPhase } from 'models/Execution/enums';
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

export const isStartOrEndEdge = edge => {
    return edge.sourceId == 'start-node' || edge.targetId == 'end-node';
};

interface BuildDataProps {
    node: dNode;
    nodeExecutionsById: any;
    onNodeSelectionChanged: any;
    onAddNestedView: any;
    onRemoveNestedView: any;
    rootParentNode: dNode;
}
export const buildReactFlowDataProps = (props: BuildDataProps) => {
    const {
        node,
        nodeExecutionsById,
        onNodeSelectionChanged,
        onAddNestedView,
        onRemoveNestedView,
        rootParentNode,
        currentNestedView
    } = props;

    const taskType = node.value?.template ? node.value.template.type : null;
    const displayName = node.scopedId;
    const mapNodeExecutionStatus = () => {
        if (nodeExecutionsById) {
            if (nodeExecutionsById[node.scopedId]) {
                return nodeExecutionsById[node.scopedId].closure
                    .phase as NodeExecutionPhase;
            } else {
                return NodeExecutionPhase.SKIPPED;
            }
        } else {
            return NodeExecutionPhase.UNDEFINED;
        }
    };
    const nodeExecutionStatus = mapNodeExecutionStatus();

    const dataProps = {
        nodeExecutionStatus: nodeExecutionStatus,
        text: displayName,
        handles: [],
        nodeType: node.type,
        scopedId: node.scopedId,
        taskType: taskType,
        onNodeSelectionChanged: () => {
            if (onNodeSelectionChanged) {
                onNodeSelectionChanged([node.scopedId]);
            }
        },
        onAddNestedView: () => {
            onAddNestedView({
                parent: rootParentNode.scopedId,
                view: node.scopedId
            });
        },
        onRemoveNestedView
    };

    for (const rootParentId in currentNestedView) {
        if (node.scopedId == rootParentId) {
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
}
export const buildReactFlowNode = ({
    node,
    dataProps,
    rootParentNode,
    parentNode
}: BuildNodeProps): rfNode => {
    const output: rfNode = {
        id: node.scopedId,
        type: buildCustomNodeName(node.type),
        data: { text: node.scopedId },
        position: { x: 0, y: 0 },
        style: {},
        sourcePosition: Position.Right,
        targetPosition: Position.Left
    };
    if (rootParentNode) {
        output['parentNode'] = rootParentNode.scopedId;
    } else if (parentNode) {
        output['parentNode'] = parentNode.scopedId;
    }

    if (output.parentNode == node.scopedId) {
        console.log('>>>>>> SAME PARENT NODE ID', node);
        delete output.parentNode;
    }

    output['data'] = buildReactFlowDataProps({
        ...dataProps,
        node,
        rootParentNode
    });
    return output;
};
interface BuildEdgeProps {
    edge: dEdge;
    rootParentNode?: dNode;
    parentNode?: dNode;
}
export const buildReactFlowEdge = ({
    edge,
    rootParentNode
}: BuildEdgeProps): rfEdge => {
    const output = {
        id: `${edge.sourceId}->${edge.targetId}`,
        source: edge.sourceId,
        target: edge.targetId,
        arrowHeadType: ReactFlowGraphConfig.arrowHeadType,
        type: ReactFlowGraphConfig.edgeType
    } as rfEdge;

    if (rootParentNode) {
        output['parent'] = rootParentNode.scopedId;
        output['zIndex'] = 1;
    }

    return output;
};

export const edgesToArray = edges => {
    return Object.values(edges);
};

export const nodesToArray = nodes => {
    return Object.values(nodes);
};

export const buildGraphMapping = (props): ReactFlowGraphMapping => {
    const dag: dNode = props.root;
    const {
        nodeExecutionsById,
        onNodeSelectionChanged,
        onAddNestedView,
        onRemoveNestedView,
        currentNestedView
    } = props;
    const nodeDataProps = {
        nodeExecutionsById,
        onNodeSelectionChanged,
        onAddNestedView,
        onRemoveNestedView,
        currentNestedView
    };
    const root: ReactFlowGraph = {
        nodes: {},
        edges: {}
    };
    const rootParentMap = {};

    interface ParseProps {
        nodeDataProps: any;
        contextNode: dNode;
        contextParent?: dNode;
        rootParentNode?: dNode;
    }
    const parse = (props: ParseProps) => {
        const {
            contextNode,
            contextParent,
            rootParentNode,
            nodeDataProps
        } = props;
        let context: ReactFlowGraph | null = null;
        contextNode.nodes.map((node: dNode) => {
            /* Case: node has children => recurse */
            if (nodeHasChildren(node)) {
                if (rootParentNode) {
                    parse({
                        contextNode: node,
                        contextParent: node,
                        rootParentNode: rootParentNode,
                        nodeDataProps: nodeDataProps
                    });
                } else {
                    parse({
                        contextNode: node,
                        contextParent: node,
                        rootParentNode: node,
                        nodeDataProps: nodeDataProps
                    });
                }
            }

            if (rootParentNode) {
                const rootParentId = rootParentNode.scopedId;
                const contextParentId = contextParent?.scopedId;
                rootParentMap[rootParentId] = rootParentMap[rootParentId] || {};
                rootParentMap[rootParentId][contextParentId] = rootParentMap[
                    rootParentId
                ][contextParentId] || {
                    nodes: {},
                    edges: {}
                };
                context = rootParentMap[rootParentId][
                    contextParentId
                ] as ReactFlowGraph;
                const reactFlowNode = buildReactFlowNode({
                    node: node,
                    dataProps: nodeDataProps,
                    rootParentNode: rootParentNode,
                    parentNode: contextParent
                });
                context.nodes[reactFlowNode.id] = reactFlowNode;
            } else {
                const reactFlowNode = buildReactFlowNode({
                    node: node,
                    dataProps: nodeDataProps
                });
                root.nodes[reactFlowNode.id] = reactFlowNode;
            }
        });
        contextNode.edges.map((edge: dEdge) => {
            const reactFlowEdge = buildReactFlowEdge({ edge, rootParentNode });
            if (rootParentNode) {
                context?.edges[reactFlowEdge.id] = reactFlowEdge;
            } else {
                root.edges[reactFlowEdge.id] = reactFlowEdge;
            }
        });
    };

    parse({ contextNode: dag, nodeDataProps: nodeDataProps });

    return {
        root,
        rootParentMap
    };
};

export const renderGraph = (
    graphMapping,
    currentNestedView,
    maxRenderDepth = 0
) => {
    console.log('>>> transformerDAGToReactFlow:@renderGraph');
    console.log('\t graphMapping:', graphMapping);
    console.log('\t currentNestedView:', currentNestedView);
    if (maxRenderDepth > 0) {
        const nestedChildGraphs: ReactFlowGraph = {
            nodes: {},
            edges: {}
        };
        const nestedContent: string[] = [];

        for (const nestedParentId in graphMapping.rootParentMap) {
            const rootParent = currentNestedView[nestedParentId];
            if (rootParent) {
                const currentView = rootParent[rootParent.length - 1];
                nestedContent.push(currentView);
            } else {
                nestedContent.push(nestedParentId);
            }
        }

        /**
         * NOTES:
         *  - Problem is that n3 says its parent is n3
         */

        for (const rootParentId in graphMapping.rootParentMap) {
            const rootParent = graphMapping.rootParentMap[rootParentId];
            /* Merge nested graphs */
            for (let i = 0; i < nestedContent.length; i++) {
                const childGraphId = nestedContent[i];
                if (rootParent[childGraphId]) {
                    nestedChildGraphs.nodes = {
                        ...nestedChildGraphs.nodes,
                        ...rootParent[childGraphId].nodes
                    };
                    nestedChildGraphs.edges = {
                        ...nestedChildGraphs.edges,
                        ...rootParent[childGraphId].edges
                    };
                }
            }
            console.log('');
            for (const parentKey in graphMapping.root.nodes) {
                const parentNode = graphMapping.root.nodes[parentKey];
                if (parentNode.id == rootParentId) {
                    parentNode['isRootParentNode'] = true;
                    parentNode['style'] = {};
                }
            }
            /** @TODO refactor this; we need this step but can prob be done better */
            for (const nodeId in nestedChildGraphs.nodes) {
                const node = nestedChildGraphs.nodes[nodeId];
                if (node.type == 'FlyteNode_subworkflow') {
                    node.type = 'FlyteNode_nestedMaxDepth';
                }
            }
        }
        const output = { ...graphMapping.root };
        output.nodes = { ...output.nodes, ...nestedChildGraphs.nodes };
        output.edges = { ...output.edges, ...nestedChildGraphs.edges };
        output.nodes = nodesToArray(output.nodes);
        output.edges = edgesToArray(output.edges);
        console.log('\t output:', output);
        return output;
    } else {
        return graphMapping.root;
    }
};

export const ConvertFlyteDagToReactFlows = (props: ConvertDagProps) => {
    console.log('@DagToReactFlow:ConvertFlyteDagToReactFlows:');
    console.log('\t props.root:', props.root);
    const graphMapping: ReactFlowGraphMapping = buildGraphMapping(props);
    return renderGraph(
        graphMapping,
        props.currentNestedView,
        props.maxRenderDepth
    );
};
