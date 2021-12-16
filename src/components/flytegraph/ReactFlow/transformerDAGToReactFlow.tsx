import { dEdge, dNode, dTypes } from 'models/Graph/types';
import { ReactFlowGraphConfig } from './utils';
import { Edge, Elements, Node, Position } from 'react-flow-renderer';
import { NodeExecutionPhase } from 'models/Execution/enums';
import { BuildRFNodeProps, ConvertDagProps, RFGraphTypes } from './types';
import e from 'express';

export const buildCustomNodeName = (type: dTypes) => {
    return `${ReactFlowGraphConfig.customNodePrefix}_${dTypes[type]}`;
};

export const isStartOrEndEdge = edge => {
    return edge.sourceId == 'start-node' || edge.targetId == 'end-node';
};

export const buildReactFlowEdge = (edge: dEdge): Edge => {
    return {
        id: `[${edge.sourceId}]->[${edge.targetId}]`,
        source: edge.sourceId,
        target: edge.targetId,
        sourceHandle: 'left-handle',
        arrowHeadType: ReactFlowGraphConfig.arrowHeadType,
        type: ReactFlowGraphConfig.edgeType
    } as Edge;
};

export const buildReactFlowNode = (props: BuildRFNodeProps): Node => {
    const {
        dNode,
        dag,
        nodeExecutionsById,
        typeOverride,
        onNodeSelectionChanged,
        onAddNestedView,
        onRemoveNestedView,
        parentNodeId
    } = props;

    const type = typeOverride ? typeOverride : dNode.type;
    const taskType = dNode?.value?.template ? dNode.value.template.type : null;
    // const displayName = dNode.name;
    const displayName = dNode.scopedId;
    const mapNodeExecutionStatus = () => {
        if (nodeExecutionsById) {
            if (nodeExecutionsById[dNode.scopedId]) {
                return nodeExecutionsById[dNode.scopedId].closure
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
        parentNodeId: parentNodeId,
        text: displayName,
        handles: [],
        nodeType: type,
        scopedId: dNode.scopedId,
        dag: dag,
        taskType: taskType,
        onNodeSelectionChanged: () => {
            if (onNodeSelectionChanged) {
                onNodeSelectionChanged([dNode.scopedId]);
            }
        },
        onAddNestedView: () => {
            onAddNestedView({
                parent: parentNodeId,
                view: dNode.scopedId
            });
        },
        onRemoveNestedView: () => {
            onRemoveNestedView(dNode.scopedId);
        }
    };

    return {
        id: dNode.scopedId,
        type: buildCustomNodeName(type),
        data: dataProps,
        position: { x: 0, y: 0 },
        sourcePosition: Position.Right,
        targetPosition: Position.Left
    } as Node;
};

export const nodeMapToArr = map => {
    const output: any[] = [];
    for (const k in map) {
        output.push(map[k]);
    }
    return output;
};

/**
 * This function taks in a DAG and transform that data into the
 * ReactFlow format
 */
export const dagToReactFlow = (props: DagToReactFlowProps) => {
    const {
        nodeExecutionsById,
        currentDepth,
        currentNestedView,
        onNodeSelectionChanged,
        onAddNestedView,
        onRemoveNestedView,
        maxRenderDepth,
        isStaticGraph,
        root
    } = props;

    const nodes: any = {};
    const edges: any = {};

    const currentView =
        currentNestedView?.length > 0
            ? currentNestedView[currentNestedView.length - 1]
            : null;

    //root.nodes?.map(dNode => {
    for (let i = 0; i < root.nodes?.length; i++) {
        let dNode = root.nodes[i];
        /* Base props to build RF Node */
        const buildNodeProps = {
            dNode: dNode,
            dag: [],
            parentNodeId: root.scopedId,
            nodeExecutionsById: nodeExecutionsById,
            typeOverride: null,
            onNodeSelectionChanged: onNodeSelectionChanged,
            onAddNestedView: onAddNestedView,
            onRemoveNestedView: onRemoveNestedView,
            isStaticGraph: isStaticGraph
        } as BuildRFNodeProps;

        /**
         * Case: not a nested view so all if-cases are nested;
         * else-cases are all flat
         *
         * Note: both cases are relative to the root dNode provided
         * so 'flat' could mean flat within nested
         */
        if (dNode.nodes?.length > 0) {
            let contextualRoot = dNode;
            if (currentView && currentView.parent == dNode.scopedId) {
                for (let j = 0; j < dNode.nodes.length; j++) {
                    if (dNode.nodes[j].scopedId == currentView.view) {
                        console.log('THIS IS IT!');
                        console.log('\t dNode.nodes[j].id:', dNode.nodes[j].id);
                        console.log('\t currentView.view:', currentView.view);
                        contextualRoot = dNode.nodes[j];
                    }
                }
            }
            const nestedDagProps: DagToReactFlowProps = {
                root: contextualRoot,
                parentNodeId: dNode.scopedId,
                nodeExecutionsById: nodeExecutionsById,
                currentDepth: currentDepth + 1,
                onNodeSelectionChanged: onNodeSelectionChanged,
                onAddNestedView: onAddNestedView,
                onRemoveNestedView: onRemoveNestedView,
                maxRenderDepth: maxRenderDepth,
                currentNestedView: currentNestedView,
                isStaticGraph: isStaticGraph
            };

            /**
             * Provide the current dNode with a dag regardless which
             * render logic results
             */
            buildNodeProps.dag = dagToReactFlow(nestedDagProps);

            /* Now decide on render logic */
            if (currentDepth >= maxRenderDepth && isStaticGraph) {
                buildNodeProps.typeOverride = dTypes.staticNestedNode;
            } else {
                if (currentDepth >= maxRenderDepth) {
                    buildNodeProps.typeOverride = dTypes.nestedMaxDepth;
                }
            }
        } else {
            /* These cases are not nested */
            buildNodeProps.typeOverride = isStaticGraph
                ? dTypes.staticNode
                : null;
        }
        /* Build and add node to map */
        nodes[dNode.id] = buildReactFlowNode(buildNodeProps);
    }

    root.edges?.map(edge => {
        const rfEdge = buildReactFlowEdge(edge, root);
        edges[rfEdge.id] = rfEdge;
    });
    const output = nodeMapToArr(nodes).concat(nodeMapToArr(edges));
    return output;
};

export const ConvertFlyteDagToReactFlows = (
    props: ConvertDagProps
): Elements => {
    const dagProps = {
        ...props,
        currentDepth: 0,
        parents: []
    } as DagToReactFlowProps;
    const rfJson = dagToReactFlow(dagProps);
    console.log('@ConvertFlyteDagToReactFlow: output:', rfJson);
    return rfJson;
};
