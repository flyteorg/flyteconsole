import React from 'react';
import { ReactFlowGraphComponent } from '../flytegraph/ReactFlow/ReactFlowGraphComponent';
import { NonIdealState } from '../common/NonIdealState';
import { ReactFlowBreadCrumbProvider } from '../flytegraph/ReactFlow/ReactFlowBreadCrumbProvider';
import t from './strings';
import { useNodeExecutionsById } from '../Executions/contextProvider/NodeExecutionDetails/WorkflowNodeExecutionsProvider';

export const WorkflowGraph: React.FC<{}> = () => {
  const {
    dagData: { mergedDag, dagError },
  } = useNodeExecutionsById();

  if (dagError) {
    return <NonIdealState title={t('graphErrorTitle')} description={dagError.message} />;
  }

  // If the dag is empty, show the message, instead of trying to display it
  if (!mergedDag) {
    return <NonIdealState title={t('graphErrorTitle')} description={t('graphErrorEmptyGraph')} />;
  }

  return (
    <ReactFlowBreadCrumbProvider>
      <ReactFlowGraphComponent />
    </ReactFlowBreadCrumbProvider>
  );
};
