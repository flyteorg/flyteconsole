import React, { useContext } from 'react';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import ExpandMore from '@mui/icons-material/ExpandMore';
import classnames from 'classnames';
import { useQuery, useQueryClient } from 'react-query';
import styled from '@mui/system/styled';
import PageMeta from '@clients/primitives/PageMeta';
import { LargeLoadingComponent, LargeLoadingSpinner } from '@clients/primitives/LoadingSpinner';
import { WaitForQuery } from '../../common/WaitForQuery';
import { DataError } from '../../Errors/DataError';
import { Execution } from '../../../models/Execution/types';
import { Workflow } from '../../../models/Workflow/types';
import { makeWorkflowQuery } from '../../../queries/workflowQueries';
import { ExecutionContext } from '../contexts';
import { useWorkflowExecutionQuery } from '../useWorkflowExecution';
import { ExecutionMetadata } from './ExecutionMetadata';
import { ExecutionNodeViews } from './ExecutionNodeViews';
import { useExecutionNodeViewsStatePoll } from './useExecutionNodeViewsStatePoll';
import { useBreadCrumbsGreyStyle } from '../../Breadcrumbs/hooks';
import { NodeExecutionDetailsContextProvider } from '../contextProvider/NodeExecutionDetails/NodeExecutionDetailsContextProvider';
import { WorkflowNodeExecutionsProvider } from '../contextProvider/NodeExecutionDetails/WorkflowNodeExecutionsProvider';

export interface ExecutionDetailsRouteParams {
  domainId: string;
  executionId: string;
  projectId: string;
}

const StyledContainer = styled('div')(({ theme }) => ({
  position: 'relative',
  height: '100%',
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  '& .expandCollapseButton': {
    transition: 'transform 0s linear',
    transform: 'rotate(0deg)',
    '&.expanded': {
      transform: 'rotate(180deg)',
    },
  },
  '& .relativer': {
    position: 'relative',
  },
  '& .expandCollapseContainer': {
    alignItems: 'center',
    bottom: 0,
    display: 'flex',
    // Matches height of tabs in the NodeViews container
    height: theme.spacing(6),
    position: 'absolute',
    right: theme.spacing(3),
    transform: 'translateY(100%)',
    zIndex: 1,
  },
}));

export const ExecutionContainer: React.FC<{}> = () => {
  const [metadataExpanded, setMetadataExpanded] = React.useState(true);
  const toggleMetadata = () => setMetadataExpanded(!metadataExpanded);

  useBreadCrumbsGreyStyle();

  return (
    <>
      <PageMeta title="Execution Details" />
      <StyledContainer>
        <div className="relative">
          <Collapse in={metadataExpanded}>
            <ExecutionMetadata />
          </Collapse>
          <div className="expandCollapseContainer">
            <IconButton size="small" onClick={toggleMetadata}>
              <ExpandMore
                className={classnames('expandCollapseButton', {
                  expanded: metadataExpanded,
                })}
              />
            </IconButton>
          </div>
        </div>
        <ExecutionNodeViews />
      </StyledContainer>
    </>
  );
};

const RenderExecutionContainer: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const { execution } = useContext(ExecutionContext);

  const {
    closure: { workflowId },
  } = execution;

  const queryClient = useQueryClient();

  const workflowQuery = useQuery<Workflow, Error>(makeWorkflowQuery(queryClient, workflowId));

  // query to get all data to build Graph and Timeline
  const { nodeExecutionsQuery } = useExecutionNodeViewsStatePoll(execution);
  return (
    <>
      {/* Fetches the current workflow to build the execution tree inside NodeExecutionDetailsContextProvider */}
      <WaitForQuery errorComponent={DataError} query={workflowQuery}>
        {(workflow) => (
          <>
            {/* Provides a node execution tree for the current workflow */}
            <NodeExecutionDetailsContextProvider initialWorkflow={workflow}>
              <WaitForQuery
                query={nodeExecutionsQuery}
                errorComponent={DataError}
                loadingComponent={LargeLoadingComponent}
              >
                {(data) => (
                  <WorkflowNodeExecutionsProvider initialNodeExecutions={data}>
                    {children}
                  </WorkflowNodeExecutionsProvider>
                )}
              </WaitForQuery>
            </NodeExecutionDetailsContextProvider>
          </>
        )}
      </WaitForQuery>
    </>
  );
};

/** The view component for the Execution Details page */
export const ExecutionDetailsWrapper: React.FC<
  React.PropsWithChildren<ExecutionDetailsRouteParams>
> = ({ children, executionId, domainId, projectId }) => {
  const id = {
    project: projectId,
    domain: domainId,
    name: executionId,
  };

  const workflowExecutionQuery = useWorkflowExecutionQuery(id);

  return (
    // get the workflow execution query to get the current workflow id
    <WaitForQuery
      errorComponent={DataError}
      loadingComponent={LargeLoadingSpinner}
      query={workflowExecutionQuery}
    >
      {(execution: Execution) => (
        <ExecutionContext.Provider
          value={{
            execution,
          }}
        >
          <RenderExecutionContainer>{children}</RenderExecutionContainer>
        </ExecutionContext.Provider>
      )}
    </WaitForQuery>
  );
};
