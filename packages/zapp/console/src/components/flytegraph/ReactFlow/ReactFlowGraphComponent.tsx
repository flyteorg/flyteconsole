import * as React from 'react';
import { useState, useEffect } from 'react';
import { ConvertFlyteDagToReactFlows } from 'components/flytegraph/ReactFlow/transformDAGToReactFlowV2';
import { RFWrapperProps, RFGraphTypes, ConvertDagProps } from './types';
import { getRFBackground } from './utils';
import { ReactFlowWrapper } from './ReactFlowWrapper';
import { Legend } from './NodeStatusLegend';

const nodeExecutionStatusChanged = (previous, nodeExecutionsById) => {
  for (const exe in nodeExecutionsById) {
    const oldStatus = previous[exe]?.closure.phase;
    const newStatus = nodeExecutionsById[exe]?.closure.phase;
    if (oldStatus !== newStatus) {
      return true;
    }
  }
  return false;
};

const nodeExecutionResourcesChanged = (previous, nodeExecutionsById) => {
  for (const exe in nodeExecutionsById) {
    const oldStatus = previous[exe]?.externalResourcesByPhase;
    const newStatus = nodeExecutionsById[exe]?.externalResourcesByPhase;
    if (oldStatus !== newStatus) {
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

const ReactFlowGraphComponent = (props) => {
  const {
    data,
    onNodeSelectionChanged,
    onMapTaskSelectionChanged,
    nodeExecutionsById,
    dynamicWorkflows,
  } = props;
  const [state, setState] = useState({
    data,
    dynamicWorkflows,
    currentNestedView: {},
    nodeExecutionsById,
    onNodeSelectionChanged,
    onMapTaskSelectionChanged,
    rfGraphJson: null,
  });

  const onAddNestedView = (view) => {
    const currentView = state.currentNestedView[view.parent] || [];
    const newView = {
      [view.parent]: [...currentView, view.view],
    };
    setState((state) => ({
      ...state,
      currentNestedView: { ...newView },
    }));
  };

  const onRemoveNestedView = (viewParent, viewIndex) => {
    const currentNestedView: any = { ...state.currentNestedView };
    currentNestedView[viewParent] = currentNestedView[viewParent]?.filter(
      (item, i) => i <= viewIndex,
    );
    if (currentNestedView[viewParent]?.length < 1) {
      delete currentNestedView[viewParent];
    }
    setState((state) => ({
      ...state,
      currentNestedView,
    }));
  };

  const buildReactFlowGraphData = () => {
    return ConvertFlyteDagToReactFlows({
      root: state.data,
      nodeExecutionsById: state.nodeExecutionsById,
      onNodeSelectionChanged: state.onNodeSelectionChanged,
      onMapTaskSelectionChanged: state.onMapTaskSelectionChanged,
      onAddNestedView: onAddNestedView,
      onRemoveNestedView: onRemoveNestedView,
      currentNestedView: state.currentNestedView,
      maxRenderDepth: 1,
    } as ConvertDagProps);
  };

  useEffect(() => {
    const newRFGraphData = buildReactFlowGraphData();
    setState((state) => ({
      ...state,
      rfGraphJson: newRFGraphData,
    }));
  }, [state.currentNestedView, state.nodeExecutionsById]);

  useEffect(() => {
    if (graphNodeCountChanged(state.data, data)) {
      setState((state) => ({
        ...state,
        data: data,
      }));
    }
    if (
      nodeExecutionStatusChanged(state.nodeExecutionsById, nodeExecutionsById) ||
      nodeExecutionResourcesChanged(state.nodeExecutionsById, nodeExecutionsById)
    ) {
      setState((state) => ({
        ...state,
        nodeExecutionsById: nodeExecutionsById,
      }));
    }
  }, [data, nodeExecutionsById]);

  useEffect(() => {
    setState((state) => ({
      ...state,
      onNodeSelectionChanged: onNodeSelectionChanged,
    }));
  }, [onNodeSelectionChanged]);

  useEffect(() => {
    setState((state) => ({
      ...state,
      onMapTaskSelectionChanged: onMapTaskSelectionChanged,
    }));
  }, [onMapTaskSelectionChanged]);

  const backgroundStyle = getRFBackground().nested;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flex: `1 1 100%`,
    flexDirection: 'column',
    minHeight: '100px',
    minWidth: '200px',
  };

  const renderGraph = () => {
    const ReactFlowProps: RFWrapperProps = {
      backgroundStyle,
      rfGraphJson: state.rfGraphJson,
      type: RFGraphTypes.main,
      nodeExecutionsById: nodeExecutionsById,
      currentNestedView: state.currentNestedView,
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
