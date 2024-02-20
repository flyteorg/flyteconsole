import React, { useState, useEffect, useCallback } from 'react';
import { Background } from 'react-flow-renderer';
import { stringifyIsEqual } from '../../../common/stringifyIsEqual';
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
import { ReactFlowStyled } from './ReactFlowStyled';

/**
 * Mapping for using custom nodes inside ReactFlow
 */
const CustomNodeTypes = {
  FlyteNode_task: ReactFlowCustomTaskNode,
  FlyteNode_subworkflow: ReactFlowSubWorkflowContainer,
  FlyteNode_start: ReactFlowCustomStartNode,
  FlyteNode_end: ReactFlowCustomEndNode,
  FlyteNode_nestedStart: ReactFlowCustomNestedPoint,

  FlyteNode_nestedEnd: ReactFlowCustomNestedPoint,
  FlyteNode_nestedMaxDepth: ReactFlowCustomMaxNested,

  FlyteNode_staticNode: ReactFlowStaticNode,
  FlyteNode_staticNestedNode: ReactFlowStaticNested,
  FlyteNode_gateNode: ReactFlowGateNode,
};

export const ReactFlowWrapper: React.FC<RFWrapperProps> = ({
  rfGraphJson,
  backgroundStyle,
  currentNestedView,
  version,
}) => {
  const [state, setState] = useState({
    shouldUpdate: true,
    nodes: rfGraphJson?.nodes || [],
    edges: rfGraphJson?.edges || [],
    version,
    reactFlowInstance: null,
    needFitView: false,
  });

  const setStateDeduped = (newState: typeof state) => {
    setState((prevState) => {
      if (stringifyIsEqual(prevState, newState)) {
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
      edges: rfGraphJson?.edges?.map((edge) => ({
        ...edge,
        zIndex: 0,
      })),
    });
  }, [rfGraphJson, rfGraphJson?.nodes, rfGraphJson?.edges, version]);

  const onLoad = (rf: any) => {
    setStateDeduped({ ...state, needFitView: true, reactFlowInstance: rf });
  };

  const onNodesChange = useCallback(
    (changes) => {
      if (changes.length === state.nodes.length && state.shouldUpdate) {
        const nodesWithDimensions: any[] = [];
        for (let i = 0; i < changes.length; i++) {
          nodesWithDimensions.push({
            ...state.nodes[i],
            dimensions: changes[i].dimensions,
          });
        }
        const positionedNodes = getPositionedNodes(
          nodesWithDimensions,
          state.edges,
          currentNestedView,
          'LR',
        );
        const { hashGraph, hashEdges } = ReactFlowIdHash(positionedNodes, state.edges);

        setStateDeduped({
          ...state,
          shouldUpdate: false,
          nodes: hashGraph,
          edges: hashEdges,
        });
      }
      if (changes.length === state.nodes.length && state.reactFlowInstance && state.needFitView) {
        (state.reactFlowInstance as any)?.fitView();
      }
    },
    [state.shouldUpdate, state.reactFlowInstance, state.needFitView, state.nodes, state.edges],
  );

  const onNodeClick = async (_event) => {
    setStateDeduped({ ...state, needFitView: false });
  };

  // re-render if nodes are not positioned
  useEffect(() => {
    const hasNodes = state.nodes.every((node) => node.position.x !== 0 || node.position.y !== 0);
    if (!hasNodes) {
      setStateDeduped({ ...state, needFitView: true });
    }
  }, [state.nodes]);

  return (
    <ReactFlowStyled
      nodes={state.nodes}
      edges={state.edges}
      nodeTypes={CustomNodeTypes}
      onNodesChange={onNodesChange}
      onNodeClick={onNodeClick}
      onInit={onLoad}
      fitView
      defaultEdgeOptions={{ zIndex: 0 }}
      attributionPosition="top-right"
    >
      <Background
        style={backgroundStyle.background}
        color={backgroundStyle.gridColor}
        gap={backgroundStyle.gridSpacing}
      />
    </ReactFlowStyled>
  );
};
