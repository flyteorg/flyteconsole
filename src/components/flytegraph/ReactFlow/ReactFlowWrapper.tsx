import * as React from 'react';
import { useState, useEffect } from 'react';
import ReactFlow, {
    Background,
    ReactFlowProvider,
    useStoreState,
    useStoreActions,
    useUpdateNodeInternals
} from 'react-flow-renderer';
import { RFWrapperProps, LayoutRCProps, RFGraphTypes } from './types';
import {
    ReactFlowCustomBranchNode,
    ReactFlowCustomEndNode,
    ReactFlowCustomNestedPoint,
    ReactFlowCustomStartNode,
    ReactFlowCustomTaskNode,
    ReactFlowCustomSubworkflowNode,
    ReactFlowCustomMaxNested,
    ReactFlowStaticNested,
    ReactFlowStaticNode
} from './customNodeComponents';
import setReactFlowGraphLayout from './utils';
import { dTypes } from 'models/Graph/types';

/**
 * Mapping for using custom nodes inside ReactFlow
 */
const CustomNodeTypes = {
    FlyteNode_task: ReactFlowCustomTaskNode,
    FlyteNode_subworkflow: ReactFlowCustomSubworkflowNode,
    FlyteNode_branch: ReactFlowCustomBranchNode,
    FlyteNode_start: ReactFlowCustomStartNode,
    FlyteNode_end: ReactFlowCustomEndNode,
    FlyteNode_nestedStart: ReactFlowCustomNestedPoint,
    FlyteNode_nestedEnd: ReactFlowCustomNestedPoint,
    FlyteNode_nestedMaxDepth: ReactFlowCustomMaxNested,
    FlyteNode_staticNode: ReactFlowStaticNode,
    FlyteNode_staticNestedNode: ReactFlowStaticNested
};

/**
 * Renderless component waits for ReactFlow to give rendered
 * dimensions before computing layout
 * @param props:LayoutRC
 * @returns: void
 */
const LayoutReactFlow: React.FC<any> = ({
    graphData,
    backgroundStyle,
    type
}) => {
    /**
     * 1. store returns mutable objects; store will update on each change
     * 2. store is updated when elements are set
     */
    const [instance, setInstance] = useState<null | any>(null);
    const [shouldUpdate, setShouldUpdate] = useState(true);
    const [shouldRefit, setShouldRefit] = useState(false);
    const [shouldClear, setShouldClear] = useState(false);
    const [renderedGraph, setRenderedGraph] = useState(graphData);
    const nodes = useStoreState(store => store.nodes);
    const edges = useStoreState(store => store.edges);
    const setElements = useStoreActions(actions => actions.setElements);

    useEffect(() => {
        if (instance && shouldRefit) {
            console.log(
                `\n\n@>>>>>> Rendering:Graph Data: ${RFGraphTypes[type]}:${graphData[0].id}`
            );
            console.log('\t renderedGraph:', renderedGraph);
            instance.fitView({ padding: 0.01 });
            setShouldRefit(false);
        }
    }, [shouldRefit, instance]);

    useEffect(() => {
        if (!shouldUpdate) {
            // setElements is load function for reactFlow

            console.log(
                `\n\n[renderedGraph] ${RFGraphTypes[type]}:${graphData[0].id}  (set ReactFlow elements)`
            );
            console.log('\t graphData:', graphData);
            setElements(renderedGraph);
        }
    }, [renderedGraph]);

    useEffect(() => {
        console.log(
            `\n\n[graphData] ${RFGraphTypes[type]}:${graphData[0].id}  (incoming from props)`
        );
        console.log('\t graphData:', graphData);
        setRenderedGraph(graphData);
        setShouldUpdate(true);
    }, [graphData, setShouldUpdate, setRenderedGraph]);

    useEffect(() => {
        if (
            shouldUpdate &&
            !shouldRefit &&
            nodes.length > 0 &&
            edges.length > 0 &&
            nodes.every(
                node => node.__rf.width != null && node.__rf.height != null
            )
        ) {
            const nodesAndEdges = (nodes as any[]).concat(edges);
            const elementsWithLayout = setReactFlowGraphLayout(
                nodesAndEdges,
                'LR'
            );

            console.log(
                `\n\n[nodes, edges] ${RFGraphTypes[type]}:${graphData[0].id}  (ReactFlow just loaded new elements)`
            );
            console.log('\t graphData:', graphData);
            /** @TODO may not need to use this timeout */
            setShouldUpdate(false);
            startRefreshTimer(elementsWithLayout);
        }
    }, [nodes, edges]);

    const renderNewGraph = data => {
        setRenderedGraph(data);
        setShouldRefit(true);
    };

    const onLoad = (rf: any) => {
        setInstance(rf);
    };

    const startRefreshTimer = data => {
        const timeout = type == RFGraphTypes.nested ? 200 : 500;
        // setElements([{}]);
        setTimeout(() => {
            renderNewGraph(data);
        }, 1);
    };

    /**
     * React Flow's min height to make it render
     */
    const reactFlowStyle: React.CSSProperties = {
        display: 'flex',
        flex: `1 1 100%`,
        flexDirection: 'column'
    };

    return (
        <ReactFlow
            elements={renderedGraph}
            onLoad={onLoad}
            nodeTypes={CustomNodeTypes}
            style={reactFlowStyle}
        >
            <Background
                style={backgroundStyle.background}
                color={backgroundStyle.gridColor}
                gap={backgroundStyle.gridSpacing}
            />
        </ReactFlow>
    );
};

/**
 * Notes:
 * To support nested graphs we wrap each flow inside its own provider/store
 * which allows us to contextualize fitView to only render when its own
 * elements change (not parents/children)
 *
 * Workflow:
 *  - set initial (unpositioned) elements and wait for onload
 *  - position elements (with rendered dimensions) in <LayoutRC>
 *  - fit view
 *
 * @see   https://reactflow.dev/docs/
 * @param props:ReactFlowWrapperProps
 * @returns rendered component
 */
export const ReactFlowWrapper: React.FC<RFWrapperProps> = ({
    rfGraphJson,
    backgroundStyle,
    version,
    nodeExecutionsById,
    type
}) => {
    const [state, setState] = useState({
        rfGraphJson: rfGraphJson,
        version: version,
        nodeExecutionsById: nodeExecutionsById
    });

    useEffect(() => {
        // console.log('STATE_CHANGE: nodeExecutionsById');
        setState(state => ({
            ...state,
            nodeExecutionsById: nodeExecutionsById
        }));
    }, [nodeExecutionsById]);

    useEffect(() => {
        // console.log('STATE_CHANGE: rfGraphJson');
        setState(state => ({
            ...state,
            rfGraphJson: rfGraphJson
        }));
    }, [rfGraphJson]);

    useEffect(() => {
        setState(state => ({ ...state, version: version }));
    }, [version]);

    return (
        <ReactFlowProvider>
            <LayoutReactFlow
                type={type}
                graphData={state.rfGraphJson}
                backgroundStyle={backgroundStyle}
            ></LayoutReactFlow>
        </ReactFlowProvider>
    );
};
