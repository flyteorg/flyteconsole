import React from 'react';
import { ExecutionTabView } from './ExecutionTabView';
import { ExecutionDetailsAppBarContent } from './ExecutionDetailsAppBarContent';

/** Contains the available ways to visualize the nodes of a WorkflowExecution */
export const ExecutionNodeViews: React.FC<{}> = () => {
  return (
    <>
      <ExecutionDetailsAppBarContent />

      <ExecutionTabView />
    </>
  );
};
