import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, { Background } from 'react-flow-renderer';
import { withNodeExecutionDynamicProvider } from 'components/Executions/contextProvider/NodeExecutionDetails/NodeExecutionDynamicProvider';
import { isEqual } from 'lodash';
import { getPositionedNodes, ReactFlowIdHash } from './utils';
import {
  ReactFlowCustomEndNode,
  ReactFlowCustomNestedPoint,
  ReactFlowCustomStartNode,
  ReactFlowCustomTaskNode,
  ReactFlowSubWorkflowContainer,
  ReactFlowCustomMaxNested,
  ReactFlowStaticNested,
  ReactFlowStaticNode,
  ReactFlowGateNode,
} from './customNodeComponents';
import { RFWrapperProps } from './types';

/**
 * Mapping for using custom nodes inside ReactFlow
 */
const CustomNodeTypes = {
  FlyteNode_task: withNodeExecutionDynamicProvider(
    ReactFlowCustomTaskNode,
    'graph',
  ),
  FlyteNode_subworkflow: withNodeExecutionDynamicProvider(
    ReactFlowSubWorkflowContainer,
    'graph',
  ),
  FlyteNode_start: ReactFlowCustomStartNode,
  FlyteNode_end: ReactFlowCustomEndNode,
  FlyteNode_nestedStart: ReactFlowCustomNestedPoint,

  FlyteNode_nestedEnd: ReactFlowCustomNestedPoint,
  FlyteNode_nestedMaxDepth: withNodeExecutionDynamicProvider(
    ReactFlowCustomMaxNested,
    'graph',
  ),
  FlyteNode_staticNode: ReactFlowStaticNode,
  FlyteNode_staticNestedNode: ReactFlowStaticNested,
  FlyteNode_gateNode: withNodeExecutionDynamicProvider(
    ReactFlowGateNode,
    'graph',
  ),
};

const reactFlowStyle: React.CSSProperties = {
  display: 'flex',
  flex: `1 1 100%`,
  flexDirection: 'column',
};

export const ReactFlowWrapper: React.FC<RFWrapperProps> = ({
  rfGraphJson,
  backgroundStyle,
  currentNestedView,
  version,
}) => {
  const [state, setState] = useState({
    shouldUpdate: true,
    nodes: rfGraphJson?.nodes,
    edges: rfGraphJson?.edges,
    version: version,
    reactFlowInstance: null,
    needFitView: false,
  });

  const setStateDeduped = (newState: typeof state) => {
    setState(prevState => {
      if (JSON.stringify(prevState) === JSON.stringify(newState)) {
        return prevState;
      }
      return newState;
    });
  };
  useEffect(() => {
    if (!rfGraphJson) {
      return;
    }
    setStateDeduped({
      ...state,
      shouldUpdate: true,
      nodes: rfGraphJson?.nodes,
      edges: rfGraphJson?.edges?.map(edge => ({
        ...edge,
        zIndex: 0,
      })),
    });
  }, [rfGraphJson]);

  const onLoad = (rf: any) => {
    setStateDeduped({ ...state, needFitView: true, reactFlowInstance: rf });
  };

  const onNodesChange = useCallback(
    changes => {
      if (changes.length === state.nodes.length && state.shouldUpdate) {
        const nodesWithDimensions: any[] = [];
        for (let i = 0; i < changes.length; i++) {
          nodesWithDimensions.push({
            ...state.nodes[i],
            ['dimensions']: changes[i].dimensions,
          });
        }
        const positionedNodes = getPositionedNodes(
          nodesWithDimensions,
          state.edges,
          currentNestedView,
          'LR',
        );
        const { hashGraph, hashEdges } = ReactFlowIdHash(
          positionedNodes,
          state.edges,
        );

        setStateDeduped({
          ...state,
          shouldUpdate: false,
          nodes: hashGraph,
          edges: hashEdges,
        });
      }
      if (
        changes.length === state.nodes.length &&
        state.reactFlowInstance &&
        state.needFitView
      ) {
        (state.reactFlowInstance as any)?.fitView();
      }
    },
    [state.shouldUpdate, state.reactFlowInstance, state.needFitView],
  );

  const onNodeClick = async _event => {
    setStateDeduped({ ...state, needFitView: false });
  };

  return (
    <ReactFlow
      nodes={state.nodes}
      edges={state.edges}
      nodeTypes={CustomNodeTypes}
      onNodesChange={onNodesChange}
      onNodeClick={onNodeClick}
      style={reactFlowStyle}
      onInit={onLoad}
      fitView
      defaultEdgeOptions={{ zIndex: 0 }}
    >
      <Background
        style={backgroundStyle.background}
        color={backgroundStyle.gridColor}
        gap={backgroundStyle.gridSpacing}
      />
    </ReactFlow>
  );
};
