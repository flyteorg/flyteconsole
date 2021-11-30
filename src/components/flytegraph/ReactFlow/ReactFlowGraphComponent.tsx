import * as React from 'react';
import { ConvertFlyteDagToReactFlows } from 'components/flytegraph/ReactFlow/transformerDAGToReactFlow';
import { useState, useEffect } from 'react';
import { RFWrapperProps, RFGraphTypes, ConvertDagProps } from './types';
import { getRFBackground } from './utils';
import { ReactFlowWrapper } from './ReactFlowWrapper';
import { Legend } from './NodeStatusLegend';
import { NodeExecutionPhase } from 'models/Execution/enums';

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
    const [state, setState] = useState({
        data: data,
        nodeExecutionsById: nodeExecutionsById,
        onNodeSelectionChanged: onNodeSelectionChanged
    });
    const [currentNestedView, setCurrentNestedView] = useState([]);

    const onAddNestedView = executionId => {
        console.log('@ReactFlowGraphComponent: addNestedView:', executionId);
        setCurrentNestedView([...currentNestedView, executionId]);
    };

    const onRemoveNestedView = (executionId = null) => {
        console.log('@ReactFlowGraphComponent: removeNestedView:', executionId);
        const current = [...currentNestedView];
        current.pop();
        setCurrentNestedView(current);
    };

    useEffect(() => {
        console.log(
            '@ReactFlowGraphComponent: useEffect[currentNestedView]',
            currentNestedView
        );
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

    const rfGraphJson = ConvertFlyteDagToReactFlows({
        root: state.data,
        nodeExecutionsById: state.nodeExecutionsById,
        onNodeSelectionChanged: state.onNodeSelectionChanged,
        onAddNestedView: onAddNestedView,
        onRemoveNestedView: onRemoveNestedView,
        currentNestedView: currentNestedView,
        maxRenderDepth: 1
    } as ConvertDagProps);

    const backgroundStyle = getRFBackground().nested;
    const ReactFlowProps: RFWrapperProps = {
        backgroundStyle,
        rfGraphJson: rfGraphJson,
        type: RFGraphTypes.main,
        nodeExecutionsById: nodeExecutionsById
    };

    const containerStyle: React.CSSProperties = {
        display: 'flex',
        flex: `1 1 100%`,
        flexDirection: 'column',
        minHeight: '100px',
        minWidth: '200px'
    };

    return (
        <div style={containerStyle}>
            <Legend />
            <ReactFlowWrapper {...ReactFlowProps} />
        </div>
    );
};

export default ReactFlowGraphComponent;
