import * as React from 'react';
import { useContext } from 'react';
import { Collapse, IconButton } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import ExpandMore from '@material-ui/icons/ExpandMore';
import classnames from 'classnames';
import { LargeLoadingSpinner } from 'components/common/LoadingSpinner';
import { WaitForQuery } from 'components/common/WaitForQuery';
import { withRouteParams } from 'components/common/withRouteParams';
import { DataError } from 'components/Errors/DataError';
import { Execution } from 'models/Execution/types';
import { RouteComponentProps } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import { Workflow } from 'models/Workflow/types';
import { makeWorkflowQuery } from 'components/Workflow/workflowQueries';
import { ExecutionContext } from '../contexts';
import { useWorkflowExecutionQuery } from '../useWorkflowExecution';
import { ExecutionDetailsAppBarContent } from './ExecutionDetailsAppBarContent';
import { ExecutionMetadata } from './ExecutionMetadata';
import { ExecutionNodeViews } from './ExecutionNodeViews';
import { NodeExecutionDetailsContextProvider } from '../contextProvider/NodeExecutionDetails';

const useStyles = makeStyles((theme: Theme) => ({
  expandCollapseButton: {
    transition: theme.transitions.create('transform'),
    '&.expanded': {
      transform: 'rotate(180deg)',
    },
  },
  expandCollapseContainer: {
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
  metadataContainer: {
    position: 'relative',
  },
}));

const RenderExecutionContainer: React.FC<{}> = () => {
  const styles = useStyles();
  const [metadataExpanded, setMetadataExpanded] = React.useState(true);
  const toggleMetadata = () => setMetadataExpanded(!metadataExpanded);

  const { execution } = useContext(ExecutionContext);

  const {
    closure: { workflowId },
  } = execution;

  const workflowQuery = useQuery<Workflow, Error>(
    makeWorkflowQuery(useQueryClient(), workflowId),
  );
  return (
    <>
      {/* Fetches the current workflow to build the execution tree inside NodeExecutionDetailsContextProvider */}
      <WaitForQuery errorComponent={DataError} query={workflowQuery}>
        {workflow => (
          <>
            {/* Provides a node execution tree for the current workflow */}
            <NodeExecutionDetailsContextProvider workflowId={workflow.id}>
              <ExecutionDetailsAppBarContent />
              <div className={styles.metadataContainer}>
                <Collapse in={metadataExpanded}>
                  <ExecutionMetadata />
                </Collapse>
                <div className={styles.expandCollapseContainer}>
                  <IconButton size="small" onClick={toggleMetadata}>
                    <ExpandMore
                      className={classnames(styles.expandCollapseButton, {
                        expanded: metadataExpanded,
                      })}
                    />
                  </IconButton>
                </div>
              </div>

              <ExecutionNodeViews />
            </NodeExecutionDetailsContextProvider>
          </>
        )}
      </WaitForQuery>
    </>
  );
};

export interface ExecutionDetailsRouteParams {
  domainId: string;
  executionId: string;
  projectId: string;
}
/** The view component for the Execution Details page */
export const ExecutionDetailsWrapper: React.FC<ExecutionDetailsRouteParams> = ({
  executionId,
  domainId,
  projectId,
}) => {
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
          <RenderExecutionContainer />
        </ExecutionContext.Provider>
      )}
    </WaitForQuery>
  );
};

export const ExecutionDetails: React.FunctionComponent<
  RouteComponentProps<ExecutionDetailsRouteParams>
> = withRouteParams<ExecutionDetailsRouteParams>(ExecutionDetailsWrapper);
