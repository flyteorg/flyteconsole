import React, { useState, useEffect } from 'react';
import { ConvertFlyteDagToReactFlows } from './transformDAGToReactFlowV2';
import { useNodeExecutionsById } from '../../Executions/contextProvider/NodeExecutionDetails/WorkflowNodeExecutionsProvider';
import { useNodeExecutionContext } from '../../Executions/contextProvider/NodeExecutionDetails/NodeExecutionDetailsContextProvider';
import { NodeExecutionPhase } from '../../../models/Execution/enums';
import { isNodeGateNode } from '../../Executions/utils';
import { dNode } from '../../../models/Graph/types';
import { extractCompiledNodes } from '../../hooks/utils';
import { stringifyIsEqual } from '../../../common/stringifyIsEqual';
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
  minHeight: '400px',
  maxHeight: '100vh',
  minWidth: '200px',
  height: '100%',
};

const backgroundStyle = getRFBackground().nested;

export const ReactFlowGraphComponent = () => {
  const {
    nodeExecutionsById,
    visibleNodes: initialDNodes,
    dagData: { mergedDag },
  } = useNodeExecutionsById();
  const { compiledWorkflowClosure } = useNodeExecutionContext();

  const [pausedNodes, setPausedNodes] = useState<dNode[]>([]);
  const { currentNestedView } = useReactFlowBreadCrumbContext();

  const [rfGraphJson, setrfGraphJson] = useState<any>();

  useEffect(() => {
    const newrfGraphJson = ConvertFlyteDagToReactFlows({
      root: mergedDag,
      maxRenderDepth: 1,
      currentNestedView,
    } as ConvertDagProps);

    setrfGraphJson((prev) => {
      if (stringifyIsEqual(prev, newrfGraphJson)) {
        return prev;
      }

      return newrfGraphJson;
    });
  }, [mergedDag, currentNestedView, setrfGraphJson]);

  useEffect(() => {
    const updatedPausedNodes: dNode[] = initialDNodes.filter((node) => {
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
    const nodesWithExecutions = updatedPausedNodes.map((node) => {
      const execution = nodeExecutionsById[node.scopedId];
      return {
        ...node,
        startedAt: execution?.closure?.startedAt,
        execution,
      };
    });
    setPausedNodes((prev) => {
      if (stringifyIsEqual(prev, nodesWithExecutions)) {
        return prev;
      }
      return nodesWithExecutions;
    });
  }, [initialDNodes, nodeExecutionsById, setPausedNodes]);

  return rfGraphJson ? (
    <div style={containerStyle}>
      {pausedNodes && pausedNodes.length > 0 && <PausedTasksComponent pausedNodes={pausedNodes} />}
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
