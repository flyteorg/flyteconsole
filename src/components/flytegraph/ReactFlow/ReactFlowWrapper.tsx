import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
    applyEdgeChanges,
    applyNodeChanges,
    Background,
    useNodesState
} from 'react-flow-renderer';
import { RFWrapperProps, RFGraphTypes } from './types';
import * as testNodes from './testNodes.json';
import * as testEdges from './testEdges.json';
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
import zIndex from '@material-ui/core/styles/zIndex';
import { testPosition, flattenNestedGraphs } from './utils';

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

export const ReactFlowWrapper: React.FC<RFWrapperProps> = ({
    rfGraphJson,
    backgroundStyle,
    version,
    nodeExecutionsById
}) => {
    // const [state, setState] = useState({
    //     rfGraphJson: rfGraphJson,
    //     version: version,
    //     nodeExecutionsById: nodeExecutionsById
    // });

    // useEffect(() => {
    //     setState(state => ({
    //         ...state,
    //         nodeExecutionsById: nodeExecutionsById
    //     }));
    // }, [nodeExecutionsById]);

    // useEffect(() => {
    //     setState(state => ({
    //         ...state,
    //         rfGraphJson: rfGraphJson
    //     }));
    // }, [rfGraphJson]);

    // useEffect(() => {
    //     setState(state => ({ ...state, version: version }));
    // }, [version]);

    const tempStyle = {
        border: '1px solid blue',
        background: 'rgba(90,55,190,.2)'
    };

    // const initialNodes = [
    //     {
    //         id: '1',
    //         data: { label: 'Node 1' },
    //         position: { x: 0, y: 0 },
    //         isParentNode: true,
    //         style: tempStyle
    //     },
    //     {
    //         id: '3',
    //         data: { label: 'Nested Node 1 -->3' },
    //         position: { x: 0, y: 0 },
    //         parentNode: '1',
    //         style: tempStyle
    //     },
    //     {
    //         id: '4',
    //         data: { label: 'Node 4' },
    //         position: { x: 0, y: 0 },
    //         style: tempStyle
    //     },
    //     {
    //         id: '5',
    //         data: { label: 'Node 5' },
    //         position: { x: 0, y: 0 },
    //         style: tempStyle
    //     },
    //     {
    //         id: '2',
    //         data: { label: 'Nested Node 1->2' },
    //         position: { x: 0, y: 0 },
    //         parentNode: '1',
    //         style: tempStyle
    //     }
    // ];

    // const initialEdges = [
    //     { id: 'e1-2', source: '1', target: '2', zIndex: 1, parent: '1' },
    //     { id: 'e2-3', source: '2', target: '3', zIndex: 1, parent: '1' },
    //     { id: 'e1-3', source: '1', target: '3', zIndex: 1, parent: '1' },
    //     { id: 'e1-4', source: '1', target: '4' },
    //     { id: 'e1-5', source: '1', target: '5' }
    // ];

    console.log('TEST:', testNodes);

    const [nodes, setNodes] = useState(testNodes);
    const [edges, setEdges] = useState(testEdges);

    const onNodesChange = useCallback(changes => {
        if (changes.length == nodes.length) {
            const nodesWithDimensions: any[] = [];
            for (let i = 0; i < changes.length; i++) {
                nodesWithDimensions.push({
                    ...nodes[i],
                    ['dimensions']: changes[i].dimensions
                });
            }
            const newNodes = testPosition(nodesWithDimensions, edges, 'LR');
            const flattened = flattenNestedGraphs(newNodes.graph);
            console.log('FLATTENED:', flattened);
            setNodes(flattened);
        }
    }, []);

    const reactFlowStyle: React.CSSProperties = {
        display: 'flex',
        flex: `1 1 100%`,
        flexDirection: 'column'
    };

    console.log('RENDER:', nodes);
    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={CustomNodeTypes}
            onNodesChange={onNodesChange}
            style={reactFlowStyle}
            fitViewOnInit
        >
            <Background
                style={backgroundStyle.background}
                color={backgroundStyle.gridColor}
                gap={backgroundStyle.gridSpacing}
            />
        </ReactFlow>
    );
};
