import React from 'react';
import { ReactFlowGraphComponent } from 'components/flytegraph/ReactFlow/ReactFlowGraphComponent';
import { NonIdealState } from 'components/common/NonIdealState';
import { CompiledNode } from 'models/Node/types';
import { ReactFlowBreadCrumbProvider } from 'components/flytegraph/ReactFlow/ReactFlowBreadCrumbProvider';
import { useNodeExecutionsById } from 'components/Executions/contextProvider/NodeExecutionDetails';
import t from './strings';

export interface DynamicWorkflowMapping {
  rootGraphNodeId: CompiledNode;
  dynamicWorkflow: any;
  dynamicExecutions: any[];
}

export const WorkflowGraph: React.FC<{}> = () => {
  const {
    dagData: { mergedDag, dagError },
  } = useNodeExecutionsById();

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
      <ReactFlowGraphComponent />
    </ReactFlowBreadCrumbProvider>
  );
};
