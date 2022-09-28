import * as React from 'react';
import ReactFlowGraphComponent from 'components/flytegraph/ReactFlow/ReactFlowGraphComponent';
import { NonIdealState } from 'components/common/NonIdealState';
import { CompiledNode } from 'models/Node/types';
import { TaskExecutionPhase } from 'models/Execution/enums';

export interface WorkflowGraphProps {
  onNodeSelectionChanged: (selectedNodes: string[]) => void;
  onPhaseSelectionChanged: (phase: TaskExecutionPhase) => void;
  selectedPhase?: TaskExecutionPhase;
  isDetailsTabClosed: boolean;
  mergedDag: any;
  error: any;
  dynamicWorkflows: any;
}
export interface DynamicWorkflowMapping {
  rootGraphNodeId: CompiledNode;
  dynamicWorkflow: any;
  dynamicExecutions: any[];
}
export const WorkflowGraph: React.FC<WorkflowGraphProps> = ({
  onNodeSelectionChanged,
  onPhaseSelectionChanged,
  selectedPhase,
  isDetailsTabClosed,
  mergedDag,
  error,
  dynamicWorkflows,
}) => {
  if (error) {
    return <NonIdealState title="Cannot render Workflow graph" description={error.message} />;
  }

  return (
    <ReactFlowGraphComponent
      dynamicWorkflows={dynamicWorkflows}
      data={mergedDag}
      onNodeSelectionChanged={onNodeSelectionChanged}
      onPhaseSelectionChanged={onPhaseSelectionChanged}
      selectedPhase={selectedPhase}
      isDetailsTabClosed={isDetailsTabClosed}
    />
  );
};
