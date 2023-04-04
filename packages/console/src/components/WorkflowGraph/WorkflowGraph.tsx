import React from 'react';
import { ReactFlowGraphComponent } from 'components/flytegraph/ReactFlow/ReactFlowGraphComponent';
import { Error } from 'models/Common/types';
import { NonIdealState } from 'components/common/NonIdealState';
import { CompiledNode } from 'models/Node/types';
import { dNode } from 'models/Graph/types';
import { useNodeExecutionsById } from 'components/Executions/contextProvider/NodeExecutionDetails';
import { useDetailsPanel } from 'components/Executions/ExecutionDetails/DetailsPanelContext';
import t from './strings';

export interface DynamicWorkflowMapping {
  rootGraphNodeId: CompiledNode;
  dynamicWorkflow: any;
  dynamicExecutions: any[];
}

export interface WorkflowGraphProps {
  mergedDag: any;
  error?: Error;
  initialNodes: dNode[];
}
export const WorkflowGraph: React.FC<WorkflowGraphProps> = ({
  mergedDag,
  error,
  initialNodes,
}) => {
  const { shouldUpdate, setShouldUpdate } = useNodeExecutionsById();

  const {
    onNodeSelectionChanged,
    selectedPhase,
    setSelectedPhase,
    isDetailsTabClosed,
  } = useDetailsPanel();

  if (error) {
    return (
      <NonIdealState title={t('graphErrorTitle')} description={error.message} />
    );
  }

  // If the dag is empty, show the message, instead of trying to display it
  if (!mergedDag) {
    return (
      <NonIdealState
        title={t('graphErrorTitle')}
        description={t('graphErrorEmptyGraph')}
      />
    );
  }

  return (
    <>
      <ReactFlowGraphComponent
        data={mergedDag}
        onNodeSelectionChanged={onNodeSelectionChanged}
        onPhaseSelectionChanged={setSelectedPhase}
        selectedPhase={selectedPhase}
        isDetailsTabClosed={isDetailsTabClosed}
        initialNodes={initialNodes}
        shouldUpdate={shouldUpdate}
        setShouldUpdate={setShouldUpdate}
      />
    </>
  );
};
