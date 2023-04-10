import React, { useContext } from 'react';
import { WaitForQuery } from 'components/common';
import { DataError } from 'components/Errors/DataError';
import { LargeLoadingComponent } from 'components/common/LoadingSpinner';
import { ExecutionContext } from '../contexts';
import { useExecutionNodeViewsStatePoll } from './useExecutionNodeViewsState';
import { ExecutionTabView } from './ExecutionTabView';
import { WorkflowNodeExecutionsProvider } from '../contextProvider/NodeExecutionDetails';

/** Contains the available ways to visualize the nodes of a WorkflowExecution */
export const ExecutionNodeViews: React.FC<{}> = () => {
  const { execution } = useContext(ExecutionContext);

  // query to get all data to build Graph and Timeline
  const { nodeExecutionsQuery } = useExecutionNodeViewsStatePoll(execution);

  return (
    <>
      <WaitForQuery
        query={nodeExecutionsQuery}
        errorComponent={DataError}
        loadingComponent={LargeLoadingComponent}
      >
        {data => (
          <WorkflowNodeExecutionsProvider initialNodeExecutions={data}>
            <ExecutionTabView />
          </WorkflowNodeExecutionsProvider>
        )}
      </WaitForQuery>
    </>
  );
};
