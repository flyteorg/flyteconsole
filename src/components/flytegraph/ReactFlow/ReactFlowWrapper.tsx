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
    const updateNodeInternals = useUpdateNodeInternals();
    const [shouldUpdate, setShouldUpdate] = useState(true);
    const [instance, setInstance] = useState<null | any>(null);
    const [graph, setGraph] = useState(graphData);
    const nodes = useStoreState(store => store.nodes);
    const edges = useStoreState(store => store.edges);
    const setElements = useStoreActions(actions => actions.setElements);

    useEffect(() => {
        if (instance && !shouldUpdate) {
            instance.fitView({ padding: 0.01 });
        }
    }, [shouldUpdate, instance]);

    useEffect(() => {
        if (!shouldUpdate) {
            // const updatedGraph = graph.map(node => {
            //     updateNodeInternals(node.id);
            //     return node;
            // });
            setElements(graph);
        }
    }, [graph, shouldUpdate, setElements]);

    useEffect(() => {
        setGraph(graphData);
        setShouldUpdate(true);
    }, [graphData]);

    useEffect(() => {
        if (
            shouldUpdate &&
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
            // console.log('type:', RFGraphTypes[type]);
            // console.log('elementsWithLayout:', elementsWithLayout);
            setGraph(elementsWithLayout);
            setShouldUpdate(false);
        }
    }, [nodes, edges]);

    const onLoad = (rf: any) => {
        setInstance(rf);
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
            elements={graph}
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
        console.log('STATE_CHANGE: nodeExecutionsById');
        setState(state => ({
            ...state,
            nodeExecutionsById: nodeExecutionsById
        }));
    }, [nodeExecutionsById]);

    useEffect(() => {
        console.log('STATE_CHANGE: rfGraphJson');
        setState(state => ({
            ...state,
            rfGraphJson: rfGraphJson
        }));
    }, [rfGraphJson]);

    useEffect(() => {
        setState(state => ({ ...state, version: version }));
    }, [version]);

    const containerStyle: React.CSSProperties = {
        display: 'flex',
        flex: `1 1 100%`,
        flexDirection: 'column',
        border: '3px solid red'
    };

    return (
        // <div style={containerStyle}>
        <ReactFlowProvider>
            <LayoutReactFlow
                type={type}
                graphData={state.rfGraphJson}
                backgroundStyle={backgroundStyle}
            ></LayoutReactFlow>
        </ReactFlowProvider>
        // </div>
    );
};

// import * as React from 'react';
// import { useState, useEffect } from 'react';
// import ReactFlow, {
//     Background,
//     ReactFlowProvider,
//     useStoreState
// } from 'react-flow-renderer';
// import { RFWrapperProps, LayoutRCProps } from './types';
// import {
//     ReactFlowCustomBranchNode,
//     ReactFlowCustomEndNode,
//     ReactFlowCustomNestedPoint,
//     ReactFlowCustomStartNode,
//     ReactFlowCustomTaskNode,
//     ReactFlowCustomSubworkflowNode,
//     ReactFlowCustomMaxNested,
//     ReactFlowStaticNested,
//     ReactFlowStaticNode
// } from './customNodeComponents';
// import setReactFlowGraphLayout from './utils';

// /**
//  * Mapping for using custom nodes inside ReactFlow
//  */
// const CustomNodeTypes = {
//     FlyteNode_task: ReactFlowCustomTaskNode,
//     FlyteNode_subworkflow: ReactFlowCustomSubworkflowNode,
//     FlyteNode_branch: ReactFlowCustomBranchNode,
//     FlyteNode_start: ReactFlowCustomStartNode,
//     FlyteNode_end: ReactFlowCustomEndNode,
//     FlyteNode_nestedStart: ReactFlowCustomNestedPoint,
//     FlyteNode_nestedEnd: ReactFlowCustomNestedPoint,
//     FlyteNode_nestedMaxDepth: ReactFlowCustomMaxNested,
//     FlyteNode_staticNode: ReactFlowStaticNode,
//     FlyteNode_staticNestedNode: ReactFlowStaticNested
// };

// /**
//  * Renderless component waits for ReactFlow to give rendered
//  * dimensions before computing layout
//  * @param props:LayoutRC
//  * @returns: void
//  */
// const LayoutRC: React.FC<LayoutRCProps> = ({
//     setElements,
//     setLayout,
//     hasLayout
// }: LayoutRCProps) => {
//     /* strore is only populated onLoad for each flow */
//     const nodes = useStoreState(store => store.nodes);
//     const edges = useStoreState(store => store.edges);

//     const [computeLayout, setComputeLayout] = useState(true);

//     if (nodes.length > 0 && computeLayout) {
//         if (nodes[0].__rf.width) {
//             setComputeLayout(false);
//         }
//     }

//     useEffect(() => {
//         if (!hasLayout && !computeLayout) {
//             setComputeLayout(true);
//         }
//     }, [hasLayout, computeLayout]);

//     useEffect(() => {
//         if (!computeLayout) {
//             const nodesAndEdges = (nodes as any[]).concat(edges);
//             const { graph } = setReactFlowGraphLayout(nodesAndEdges, 'LR');
//             setElements(graph);
//             setLayout(true);
//         }
//     }, [computeLayout]);

//     return null;
// };

// /**
//  * Notes:
//  * To support nested graphs we wrap each flow inside its own provider/store
//  * which allows us to contextualize fitView to only render when its own
//  * elements change (not parents/children)
//  *
//  * Workflow:
//  *  - set initial (unpositioned) elements and wait for onload
//  *  - position elements (with rendered dimensions) in <LayoutRC>
//  *  - fit view
//  *
//  * @see   https://reactflow.dev/docs/
//  * @param props:ReactFlowWrapperProps
//  * @returns rendered component
//  */
// export const ReactFlowWrapper: React.FC<RFWrapperProps> = ({
//     rfGraphJson,
//     backgroundStyle,
//     version
// }) => {
//     const [elements, setElements] = useState(rfGraphJson);
//     const [currentVersion, setCurrentVersion] = useState(version);
//     const [hasLayout, setHasLayout] = useState(false);
//     const [reactFlowInstance, setReactFlowInstance] = useState<null | any>(
//         null
//     );

//     const onLoad = (rf: any) => {
//         setReactFlowInstance(rf);
//     };

//     useEffect(() => {
//         if (version != currentVersion) {
//             setHasLayout(false);
//             setElements(rfGraphJson);
//         }
//     }, [version, rfGraphJson, currentVersion]);

//     /**
//      * Note: setLayout passed/called by <LayoutRC>
//      */
//     useEffect(() => {
//         if (hasLayout && reactFlowInstance) {
//             reactFlowInstance?.fitView({ padding: 0 });
//             setCurrentVersion(version);
//         }
//     }, [hasLayout, reactFlowInstance]);
//     /**
//      * STEPS:
//      *  - have each node click return nodes {text.data}
//      *  - Then figure out the input needed for the slide out (execution id? node id?)
//      *  - Append that to the rf nodes {data} object.
//      */

//     /**
//      * React Flow's min height to make it render
//      */
//     const reactFlowStyle: React.CSSProperties = {
//         display: 'flex',
//         flex: `1 1 100%`,
//         flexDirection: 'column'
//     };

//     return (
//         <ReactFlowProvider>
//             <ReactFlow
//                 elements={elements}
//                 onLoad={onLoad}
//                 nodeTypes={CustomNodeTypes}
//                 style={reactFlowStyle}
//             >
//                 <Background
//                     style={backgroundStyle.background}
//                     color={backgroundStyle.gridColor}
//                     gap={backgroundStyle.gridSpacing}
//                 />
//             </ReactFlow>
//             <LayoutRC
//                 hasLayout={hasLayout}
//                 setLayout={setHasLayout}
//                 setElements={setElements}
//             ></LayoutRC>
//         </ReactFlowProvider>
//     );
// };
