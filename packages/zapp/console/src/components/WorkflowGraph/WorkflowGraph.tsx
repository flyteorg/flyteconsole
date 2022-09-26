import * as React from 'react';
import ReactFlowGraphComponent from 'components/flytegraph/ReactFlow/ReactFlowGraphComponent';
import { NonIdealState } from 'components/common/NonIdealState';
import { DataError } from 'components/Errors/DataError';
import { WaitForQuery } from 'components/common/WaitForQuery';
import { useNodeExecutionContext } from 'components/Executions/contextProvider/NodeExecutionDetails';
import { useQuery } from 'react-query';
import { makeNodeExecutionDynamicWorkflowQuery } from 'components/Workflow/workflowQueries';
import { createDebugLogger } from 'common/log';
import { CompiledNode } from 'models/Node/types';
import { TaskExecutionPhase } from 'models/Execution/enums';
import { NodeExecutionsByIdContext } from 'components/Executions/contexts';
import { useContext } from 'react';
import { checkForDynamicExecutions } from 'components/common/utils';
import { transformerWorkflowToDag } from './transformerWorkflowToDag';

export interface WorkflowGraphProps {
  onNodeSelectionChanged: (selectedNodes: string[]) => void;
  onPhaseSelectionChanged: (phase: TaskExecutionPhase) => void;
  selectedPhase?: TaskExecutionPhase;
  isDetailsTabClosed: boolean;
}

const debug = createDebugLogger('@WorkflowGraph');
export interface DynamicWorkflowMapping {
  rootGraphNodeId: CompiledNode;
  dynamicWorkflow: any;
  dynamicExecutions: any[];
}
export const WorkflowGraph: React.FC<WorkflowGraphProps> = (props) => {
  const { onNodeSelectionChanged, onPhaseSelectionChanged, selectedPhase, isDetailsTabClosed } =
    props;
  const nodeExecutionsById = useContext(NodeExecutionsByIdContext);
  const { compiledWorkflowClosure } = useNodeExecutionContext();
  const { dag, staticExecutionIdsMap, error } = compiledWorkflowClosure
    ? transformerWorkflowToDag(compiledWorkflowClosure)
    : { dag: {}, staticExecutionIdsMap: {}, error: null };

  const dynamicParents = checkForDynamicExecutions(nodeExecutionsById, staticExecutionIdsMap);
  const dynamicWorkflowQuery = useQuery(makeNodeExecutionDynamicWorkflowQuery(dynamicParents));
  const renderReactFlowGraph = (dynamicWorkflows) => {
    debug('DynamicWorkflows:', dynamicWorkflows);
    let mergedDag = dag;
    for (const dynamicId in dynamicWorkflows) {
      if (staticExecutionIdsMap[dynamicId]) {
        if (compiledWorkflowClosure) {
          const dynamicWorkflow = transformerWorkflowToDag(
            compiledWorkflowClosure,
            dynamicWorkflows,
          );
          mergedDag = dynamicWorkflow.dag;
        }
      }
    }
    const merged = mergedDag;
    return (
      <ReactFlowGraphComponent
        dynamicWorkflows={dynamicWorkflows}
        data={merged}
        onNodeSelectionChanged={onNodeSelectionChanged}
        onPhaseSelectionChanged={onPhaseSelectionChanged}
        selectedPhase={selectedPhase}
        isDetailsTabClosed={isDetailsTabClosed}
      />
    );
  };

  if (error) {
    return <NonIdealState title="Cannot render Workflow graph" description={error.message} />;
  } else {
    return (
      <WaitForQuery errorComponent={DataError} query={dynamicWorkflowQuery}>
        {renderReactFlowGraph}
      </WaitForQuery>
    );
  }
};
