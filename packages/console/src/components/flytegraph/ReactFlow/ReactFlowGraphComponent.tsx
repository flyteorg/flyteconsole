import React, { useState, useEffect } from 'react';
import { ConvertFlyteDagToReactFlows } from 'components/flytegraph/ReactFlow/transformDAGToReactFlowV2';
import {
  useNodeExecutionContext,
  useNodeExecutionsById,
} from 'components/Executions/contextProvider/NodeExecutionDetails';
import { NodeExecutionPhase } from 'models/Execution/enums';
import { isNodeGateNode } from 'components/Executions/utils';
import { dNode } from 'models/Graph/types';
import { extractCompiledNodes } from 'components/hooks/utils';
import { useDetailsPanel } from 'components/Executions/ExecutionDetails/DetailsPanelContext';
import { RFGraphTypes, ConvertDagProps } from './types';
import { getRFBackground } from './utils';
import { ReactFlowWrapper } from './ReactFlowWrapper';
import { Legend } from './NodeStatusLegend';
import { PausedTasksComponent } from './PausedTasksComponent';
import { useReactFlowBreadCrumbContext } from './ReactFlowBreadCrumbProvider';

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flex: `1 1 100%`,
  flexDirection: 'column',
  minHeight: '100px',
  minWidth: '200px',
  height: '100%',
};

export const ReactFlowGraphComponent = () => {
  const {
    selectedPhase,
    isDetailsTabClosed,
    onNodeSelectionChanged,
    setSelectedPhase: onPhaseSelectionChanged,
  } = useDetailsPanel();
  const {
    nodeExecutionsById,
    initialDNodes,
    dagData: { mergedDag },
  } = useNodeExecutionsById();
  const { compiledWorkflowClosure } = useNodeExecutionContext();

  const [pausedNodes, setPausedNodes] = useState<dNode[]>([]);
  const { currentNestedView } = useReactFlowBreadCrumbContext();

  const [rfGraphJson, setrfGraphJson] = useState<any>();

  useEffect(() => {
    const newrfGraphJson = ConvertFlyteDagToReactFlows({
      root: mergedDag,
      onNodeSelectionChanged,
      onPhaseSelectionChanged,
      selectedPhase,
      maxRenderDepth: 1,
      currentNestedView,
    } as ConvertDagProps);
    setrfGraphJson(newrfGraphJson);
  }, [
    initialDNodes,
    mergedDag,
    isDetailsTabClosed,
    onNodeSelectionChanged,
    onPhaseSelectionChanged,
    selectedPhase,
    currentNestedView,
  ]);

  const backgroundStyle = getRFBackground().nested;

  useEffect(() => {
    const updatedPausedNodes: dNode[] = initialDNodes.filter(node => {
      const nodeExecution = nodeExecutionsById[node.id];
      if (nodeExecution) {
        const phase = nodeExecution?.closure.phase;
        const isGateNode = isNodeGateNode(
          extractCompiledNodes(compiledWorkflowClosure),
          nodeExecution.metadata?.specNodeId || nodeExecution.id.nodeId,
        );
        return isGateNode && phase === NodeExecutionPhase.RUNNING;
      }
      return false;
    });
    const nodesWithExecutions = updatedPausedNodes.map(node => {
      const execution = nodeExecutionsById[node.scopedId];
      return {
        ...node,
        startedAt: execution?.closure.startedAt,
        execution,
      };
    });
    setPausedNodes(nodesWithExecutions);
  }, [initialDNodes]);

  return rfGraphJson ? (
    <div style={containerStyle}>
      {pausedNodes && pausedNodes.length > 0 && (
        <PausedTasksComponent pausedNodes={pausedNodes} />
      )}
      <Legend />
      <ReactFlowWrapper
        backgroundStyle={backgroundStyle}
        rfGraphJson={rfGraphJson}
        type={RFGraphTypes.main}
        currentNestedView={currentNestedView}
      />
    </div>
  ) : (
    <></>
  );
};
