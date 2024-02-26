import React from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { Workflow, WorkflowId } from '../../models/Workflow/types';
import { WaitForQuery } from '../common/WaitForQuery';
import { DataError } from '../Errors/DataError';
import { transformerWorkflowToDag } from '../WorkflowGraph/transformerWorkflowToDag';
import { ReactFlowWrapper } from '../flytegraph/ReactFlow/ReactFlowWrapper';
import { ConvertFlyteDagToReactFlows } from '../flytegraph/ReactFlow/transformDAGToReactFlowV2';
import { getRFBackground } from '../flytegraph/ReactFlow/utils';
import { RFWrapperProps } from '../flytegraph/ReactFlow/types';
import { makeWorkflowQuery } from '../../queries/workflowQueries';

export const renderStaticGraph = (props) => {
  const workflow = props.closure.compiledWorkflow;
  const { dag } = transformerWorkflowToDag(workflow);
  const rfGraphJson = ConvertFlyteDagToReactFlows({
    root: dag,
    maxRenderDepth: 0,
    currentNestedView: [],
    isStaticGraph: true,
  });

  const backgroundStyle = getRFBackground().static;
  const ReactFlowProps: RFWrapperProps = {
    backgroundStyle,
    rfGraphJson,
    currentNestedView: [],
  };
  return <ReactFlowWrapper {...ReactFlowProps} />;
};

export interface StaticGraphContainerProps {
  workflowId: WorkflowId;
}

export const StaticGraphContainer: React.FC<StaticGraphContainerProps> = ({ workflowId }) => {
  const workflowQuery = useQuery<Workflow, Error>(makeWorkflowQuery(useQueryClient(), workflowId));

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
      }}
    >
      <WaitForQuery query={workflowQuery} errorComponent={DataError}>
        {renderStaticGraph}
      </WaitForQuery>
    </div>
  );
};
