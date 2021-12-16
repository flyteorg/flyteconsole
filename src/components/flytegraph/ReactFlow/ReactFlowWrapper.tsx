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
    const [graphWithPositions, setGraphWithPositions] = useState(graphData);
    const nodes = useStoreState(store => store.nodes);
    const edges = useStoreState(store => store.edges);
    const setElements = useStoreActions(actions => actions.setElements);

    useEffect(() => {
        if (instance && shouldRefit) {
            console.log(
                `\n\n@>>>>>> Rendering/Fitting: ${RFGraphTypes[type]}:${graphData[0].id}`
            );
            console.log('\t renderedGraph:', graphWithPositions);
            instance.fitView({ padding: 0.01 });
            setShouldRefit(false);
        }
    }, [shouldRefit, instance]);

    useEffect(() => {
        if (!shouldUpdate) {
            // setElements is load function for reactFlow

            console.log(
                `\n\n[graphWithPositions] ${RFGraphTypes[type]}:${graphData[0].id}  ---> ReactFlow.setElements()`
            );
            console.log('\t graphData:', graphData);
            setElements(graphWithPositions);
        }
    }, [graphWithPositions]);

    useEffect(() => {
        console.log(
            `\n\n[graphData] ${RFGraphTypes[type]}:${graphData[0].id}  --> (incoming from props)`
        );
        console.log('\t graphData:', graphData);
        if (!shouldUpdate) {
            setElements(graphData);
            setShouldUpdate(true);
            setShouldRefit(false);
        }
    }, [graphData, setShouldUpdate]);

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
                `\n\n[useStore(nodes, edges)] ${RFGraphTypes[type]}:${graphData[0].id}  --- ReactFlow.store detected elements`
            );
            console.log('\t graphData:', graphData);
            setShouldUpdate(false);
            renderPositionedElements(elementsWithLayout);
        }
    }, [nodes, edges]);

    const renderPositionedElements = data => {
        setGraphWithPositions(data);
        setShouldRefit(true);
    };

    const onLoad = (rf: any) => {
        setInstance(rf);
    };

    // const startRefreshTimer = data => {
    //     const timeout = type == RFGraphTypes.nested ? 100 : 500;
    //     setElements([{}]);
    //     setTimeout(() => {
    //         renderPositionedElements(data);
    //     }, timeout);
    //     renderPositionedElements(data);
    // };

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
            elements={graphWithPositions}
            onLoad={onLoad}
            nodeTypes={CustomNodeTypes}
            style={reactFlowStyle}
            onlyRenderVisibleElements={false}
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
        setState(state => ({
            ...state,
            nodeExecutionsById: nodeExecutionsById
        }));
    }, [nodeExecutionsById]);

    useEffect(() => {
        setState(state => ({
            ...state,
            rfGraphJson: rfGraphJson
        }));
    }, [rfGraphJson]);

    useEffect(() => {
        setState(state => ({ ...state, version: version }));
    }, [version]);

    const key = `${rfGraphJson[0]?.id}${rfGraphJson[1]?.id}${type}`;
    console.log('key:', key);

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
