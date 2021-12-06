import * as React from 'react';
import { ConvertFlyteDagToReactFlows } from 'components/flytegraph/ReactFlow/transformerDAGToReactFlow';
import { useState, useEffect } from 'react';
import { RFWrapperProps, RFGraphTypes, ConvertDagProps } from './types';
import { getRFBackground } from './utils';
import { ReactFlowWrapper } from './ReactFlowWrapper';
import { Legend } from './NodeStatusLegend';

/**
 * Renders workflow graph using React Flow.
 * @param props.data    DAG from transformerWorkflowToDAG
 * @returns ReactFlow Graph as <ReactFlowWrapper>
 */

const nodeExecutionStatusChanged = (previous, nodeExecutionsById) => {
    for (const exe in nodeExecutionsById) {
        const oldStatus = previous[exe]?.closure.phase;
        const newStatus = nodeExecutionsById[exe]?.closure.phase;
        if (oldStatus != newStatus) {
            return true;
        }
    }
    return false;
};

const graphNodeCountChanged = (previous, data) => {
    if (previous.nodes.length !== data.nodes.length) {
        return true;
    } else {
        return false;
    }
};

const ReactFlowGraphComponent = props => {
    const { data, onNodeSelectionChanged, nodeExecutionsById } = props;
    // const [currentNestedView, setCurrentNestedView] = useState([
    //     {
    //         parent: 'n1',
    //         view: 'n1-0-n1'
    //     }
    // ]);
    const [currentNestedView, setCurrentNestedView] = useState([]);
    const [state, setState] = useState({
        data: data,
        nodeExecutionsById: nodeExecutionsById,
        onNodeSelectionChanged: onNodeSelectionChanged,
        rfGraphJson: null
    });

    const onAddNestedView = executionId => {
        setCurrentNestedView([...currentNestedView, executionId]);
    };

    const onRemoveNestedView = (executionId = null) => {
        const current = [...currentNestedView];
        current.pop();
        setCurrentNestedView(current);
    };

    const buildReactFlowGraphData = () => {
        return ConvertFlyteDagToReactFlows({
            root: state.data,
            nodeExecutionsById: state.nodeExecutionsById,
            onNodeSelectionChanged: state.onNodeSelectionChanged,
            onAddNestedView: onAddNestedView,
            onRemoveNestedView: onRemoveNestedView,
            currentNestedView: currentNestedView,
            maxRenderDepth: 1
        } as ConvertDagProps);
    };

    useEffect(() => {
        const newRFGraphData = buildReactFlowGraphData();
        setState(state => ({
            ...state,
            rfGraphJson: newRFGraphData
        }));
    }, [currentNestedView]);

    useEffect(() => {
        if (graphNodeCountChanged(state.data, data)) {
            setState(state => ({
                ...state,
                data: data
            }));
        }
        if (
            nodeExecutionStatusChanged(
                state.nodeExecutionsById,
                nodeExecutionsById
            )
        ) {
            setState(state => ({
                ...state,
                nodeExecutionsById: nodeExecutionsById
            }));
        }
    }, [data, nodeExecutionsById]);

    useEffect(() => {
        setState(state => ({
            ...state,
            onNodeSelectionChanged: onNodeSelectionChanged
        }));
    }, [onNodeSelectionChanged]);

    const backgroundStyle = getRFBackground().nested;

    const containerStyle: React.CSSProperties = {
        display: 'flex',
        flex: `1 1 100%`,
        flexDirection: 'column',
        minHeight: '100px',
        minWidth: '200px'
    };

    const renderGraph = () => {
        const ReactFlowProps: RFWrapperProps = {
            backgroundStyle,
            rfGraphJson: state.rfGraphJson,
            type: RFGraphTypes.main,
            nodeExecutionsById: nodeExecutionsById
        };
        return (
            <div style={containerStyle}>
                <Legend />
                <ReactFlowWrapper {...ReactFlowProps} />
            </div>
        );
    };

    return state.rfGraphJson ? renderGraph() : <></>;
};

export default ReactFlowGraphComponent;
