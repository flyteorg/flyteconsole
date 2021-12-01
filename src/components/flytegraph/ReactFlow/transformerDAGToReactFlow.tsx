import { dEdge, dTypes } from 'models/Graph/types';
import { ReactFlowGraphConfig } from './utils';
import { Edge, Elements, Node, Position } from 'react-flow-renderer';
import { NodeExecutionPhase } from 'models/Execution/enums';
import {
    BuildRFNodeProps,
    ConvertDagProps,
    DagToReactFlowProps
} from './types';

export const buildCustomNodeName = (type: dTypes) => {
    return `${ReactFlowGraphConfig.customNodePrefix}_${dTypes[type]}`;
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
        onRemoveNestedView
    } = props;

    const type = typeOverride ? typeOverride : dNode.type;
    const taskType = dNode?.value?.template ? dNode.value.template.type : null;
    const displayName = dNode.name;

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
            onAddNestedView(dNode.scopedId);
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

export const dagToReactFlow = (props: DagToReactFlowProps) => {
    const {
        root,
        nodeExecutionsById,
        currentDepth,
        onNodeSelectionChanged,
        onAddNestedView,
        onRemoveNestedView,
        maxRenderDepth,
        isStaticGraph
    } = props;

    const nodes: any = {};
    const edges: any = {};

    root.nodes?.map(dNode => {
        /* Base props to build RF Node */
        const buildNodeProps = {
            dNode: dNode,
            dag: [],
            nodeExecutionsById: nodeExecutionsById,
            typeOverride: null,
            onNodeSelectionChanged: onNodeSelectionChanged,
            onAddNestedView: onAddNestedView,
            onRemoveNestedView: onRemoveNestedView,
            isStaticGraph: isStaticGraph
        } as BuildRFNodeProps;
        if (dNode.nodes?.length > 0) {
            /* Note: currentDepth will be replaced once nested toggle */
            const nestedDagProps: DagToReactFlowProps = {
                root: dNode,
                nodeExecutionsById: nodeExecutionsById,
                currentDepth: currentDepth + 1,
                onNodeSelectionChanged: onNodeSelectionChanged,
                onAddNestedView: onAddNestedView,
                onRemoveNestedView: onRemoveNestedView,
                maxRenderDepth: maxRenderDepth,
                isStaticGraph: isStaticGraph
            };

            if (currentDepth >= maxRenderDepth && isStaticGraph) {
                buildNodeProps.typeOverride = dTypes.staticNestedNode;
            } else {
                buildNodeProps.dag = dagToReactFlow(nestedDagProps);
                if (currentDepth >= maxRenderDepth) {
                    // buildNodeProps.typeOverride = dTypes.nestedMaxDepth;
                } else {
                    buildNodeProps.typeOverride = isStaticGraph
                        ? dTypes.staticNode
                        : null;
                }
            }
        } else {
            buildNodeProps.typeOverride = isStaticGraph
                ? dTypes.staticNode
                : null;
        }
        /* Build and add node to map */
        nodes[dNode.id] = buildReactFlowNode(buildNodeProps);
    });
    root.edges?.map(edge => {
        const rfEdge = buildReactFlowEdge(edge);
        edges[rfEdge.id] = rfEdge;
    });
    const output = nodeMapToArr(nodes).concat(nodeMapToArr(edges));
    return output;
};

export const ConvertFlyteDagToReactFlows = (
    props: ConvertDagProps
): Elements => {
    const dagProps = { ...props, currentDepth: 0 } as DagToReactFlowProps;
    const rfJson = dagToReactFlow(dagProps);

    console.log('RRFJASON:', rfJson);
    return rfJson;
};
