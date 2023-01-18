import * as React from 'react';
import { useState, useEffect, useCallback, useContext } from 'react';
import ReactFlow, { Background } from 'react-flow-renderer';
import { NodeExecutionsByIdContext } from 'components/Executions/contexts';
import { isChildGroupsFetched } from 'components/Executions/ExecutionDetails/utils';
import { fetchChildNodeExecutionGroups } from 'components/Executions/nodeExecutionQueries';
import { clone, isEqual, keyBy, merge } from 'lodash';
import { useQueryClient } from 'react-query';
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
  setShouldUpdate,
}) => {
  const queryClient = useQueryClient();
  const { nodeExecutionsById, setCurrentNodeExecutionsById } =
    useContext(NodeExecutionsByIdContext);
  const [state, setState] = useState({
    shouldUpdate: true,
    nodes: rfGraphJson.nodes,
    edges: rfGraphJson.edges,
    version: version,
    reactFlowInstance: null,
    needFitView: false,
  });

  useEffect(() => {
    setState((state) => ({
      ...state,
      shouldUpdate: true,
      nodes: rfGraphJson.nodes,
      edges: rfGraphJson.edges.map((edge) => ({ ...edge, zIndex: 0 })),
    }));
  }, [rfGraphJson]);

  const onLoad = (rf: any) => {
    setState({ ...state, needFitView: true, reactFlowInstance: rf });
  };

  const onNodesChange = useCallback(
    (changes) => {
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
        const { hashGraph, hashEdges } = ReactFlowIdHash(positionedNodes, state.edges);

        setState((state) => ({
          ...state,
          shouldUpdate: false,
          nodes: hashGraph,
          edges: hashEdges,
        }));
      }
      if (changes.length === state.nodes.length && state.reactFlowInstance && state.needFitView) {
        (state.reactFlowInstance as any)?.fitView();
      }
    },
    [state.shouldUpdate, state.reactFlowInstance, state.needFitView],
  );

  const reactFlowStyle: React.CSSProperties = {
    display: 'flex',
    flex: `1 1 100%`,
    flexDirection: 'column',
  };

  const onNodeClick = async (_event, node) => {
    // TODO make sure undefined is not pushed to nodeExecutionsById
    const scopedId = node.data.scopedId;
    const nodeExecution = nodeExecutionsById[scopedId];
    if (node.data.isParentNode) {
      if (!isChildGroupsFetched(scopedId, nodeExecutionsById)) {
        const childGroups = await fetchChildNodeExecutionGroups(queryClient, nodeExecution, {});

        let childGroupsExecutionsById;
        childGroups.forEach((group) => {
          childGroupsExecutionsById = merge(
            childGroupsExecutionsById,
            keyBy(group.nodeExecutions, 'scopedId'),
          );
        });
        const prevNodeExecutionsById = clone(nodeExecutionsById);
        const currentNodeExecutionsById = merge(nodeExecutionsById, childGroupsExecutionsById);
        if (setShouldUpdate && !isEqual(prevNodeExecutionsById, currentNodeExecutionsById)) {
          setShouldUpdate(true);
        }

        setCurrentNodeExecutionsById(currentNodeExecutionsById);
      }
    }
    setState((state) => ({ ...state, needFitView: false }));
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
