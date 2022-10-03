import { WaitForQuery } from 'components/common/WaitForQuery';
import { DataError } from 'components/Errors/DataError';
import { makeWorkflowQuery } from 'components/Workflow/workflowQueries';
import { Admin } from 'flyteidl';
import { Workflow } from 'models/Workflow/types';
import * as React from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useNodeExecutionContext } from '../contextProvider/NodeExecutionDetails';
import { ScaleProvider } from './Timeline/scaleContext';
import { ExecutionTabContent } from './ExecutionTabContent';

export interface ExecutionTabProps {
  tabType: string;
  abortMetadata?: Admin.IAbortMetadata;
}

/** Contains the available ways to visualize the nodes of a WorkflowExecution */
export const ExecutionTab: React.FC<ExecutionTabProps> = ({ tabType, abortMetadata }) => {
  const queryClient = useQueryClient();
  const { workflowId } = useNodeExecutionContext();
  const workflowQuery = useQuery<Workflow, Error>(makeWorkflowQuery(queryClient, workflowId));

  return (
    <ScaleProvider>
      <WaitForQuery errorComponent={DataError} query={workflowQuery}>
        {() => <ExecutionTabContent tabType={tabType} abortMetadata={abortMetadata} />}
      </WaitForQuery>
    </ScaleProvider>
  );
};
