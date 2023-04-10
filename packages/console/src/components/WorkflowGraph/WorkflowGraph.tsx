import React from 'react';
import { ReactFlowGraphComponent } from 'components/flytegraph/ReactFlow/ReactFlowGraphComponent';
import { NonIdealState } from 'components/common/NonIdealState';
import { CompiledNode } from 'models/Node/types';
import { useDetailsPanel } from 'components/Executions/ExecutionDetails/DetailsPanelContext';
import { ReactFlowBreadCrumbProvider } from 'components/flytegraph/ReactFlow/ReactFlowBreadCrumbProvider';
import { IWorkflowNodeExecutionsContext } from 'components/Executions/contexts';
import t from './strings';

export interface DynamicWorkflowMapping {
  rootGraphNodeId: CompiledNode;
  dynamicWorkflow: any;
  dynamicExecutions: any[];
}

export const WorkflowGraph: React.FC<{
  executionsContext: IWorkflowNodeExecutionsContext;
}> = ({ executionsContext }) => {
  const {
    selectedPhase,
    isDetailsTabClosed,
    onNodeSelectionChanged,
    setSelectedPhase: onPhaseSelectionChanged,
  } = useDetailsPanel();
  const {
    initialDNodes: initialNodes,
    dagData: { mergedDag, dagError },
  } = executionsContext;

  if (dagError) {
    return (
      <NonIdealState
        title={t('graphErrorTitle')}
        description={dagError.message}
      />
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
    <ReactFlowBreadCrumbProvider>
      <ReactFlowGraphComponent
        data={mergedDag}
        onNodeSelectionChanged={onNodeSelectionChanged}
        onPhaseSelectionChanged={onPhaseSelectionChanged}
        selectedPhase={selectedPhase}
        isDetailsTabClosed={isDetailsTabClosed}
        initialNodes={initialNodes}
      />
    </ReactFlowBreadCrumbProvider>
  );
};
