import * as React from 'react';
import { useContext, useEffect } from 'react';
import { Collapse, IconButton } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import ExpandMore from '@material-ui/icons/ExpandMore';
import classnames from 'classnames';
import {
  LargeLoadingComponent,
  LargeLoadingSpinner,
} from 'components/common/LoadingSpinner';
import { WaitForQuery } from 'components/common/WaitForQuery';
import { withRouteParams } from 'components/common/withRouteParams';
import { DataError } from 'components/Errors/DataError';
import { Execution } from 'models/Execution/types';
import { RouteComponentProps } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import { Workflow } from 'models/Workflow/types';
import { makeWorkflowQuery } from 'components/Workflow/workflowQueries';
import { useBreadCrumbsGreyStyle } from 'components/Breadcrumbs';
import { ExecutionContext } from '../contexts';
import { useWorkflowExecutionQuery } from '../useWorkflowExecution';
import { ExecutionMetadata } from './ExecutionMetadata';
import { ExecutionNodeViews } from './ExecutionNodeViews';
import {
  NodeExecutionDetailsContextProvider,
  WorkflowNodeExecutionsProvider,
} from '../contextProvider/NodeExecutionDetails';
import { useExecutionNodeViewsStatePoll } from './useExecutionNodeViewsState';

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

const ExecutionContainer: React.FC<{}> = () => {
  const styles = useStyles();
  const [metadataExpanded, setMetadataExpanded] = React.useState(true);
  const toggleMetadata = () => setMetadataExpanded(!metadataExpanded);

  useBreadCrumbsGreyStyle();

  return (
    <>
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
    </>
  );
};

const RenderExecutionContainer: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const { execution } = useContext(ExecutionContext);

  const {
    closure: { workflowId },
  } = execution;

  const workflowQuery = useQuery<Workflow, Error>(
    makeWorkflowQuery(useQueryClient(), workflowId),
  );

  // query to get all data to build Graph and Timeline
  const { nodeExecutionsQuery } = useExecutionNodeViewsStatePoll(execution);
  return (
    <>
      {/* Fetches the current workflow to build the execution tree inside NodeExecutionDetailsContextProvider */}
      <WaitForQuery errorComponent={DataError} query={workflowQuery}>
        {workflow => (
          <>
            {/* Provides a node execution tree for the current workflow */}
            <NodeExecutionDetailsContextProvider workflowId={workflow.id}>
              <WaitForQuery
                query={nodeExecutionsQuery}
                errorComponent={DataError}
                loadingComponent={LargeLoadingComponent}
              >
                {data => (
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

export function withExecutionDetails<P extends ExecutionDetailsRouteParams>(
  WrappedComponent: React.FC<P>,
) {
  return (props: P) => {
    const [localRouteProps, setLocalRouteProps] = React.useState<P>();

    useEffect(() => {
      setLocalRouteProps(prev => {
        if (JSON.stringify(prev) === JSON.stringify(props)) {
          return prev;
        }

        return props;
      });
    }, [props]);

    if (!localRouteProps) {
      return <LargeLoadingComponent />;
    }
    return (
      <ExecutionDetailsWrapper {...localRouteProps!}>
        <WrappedComponent {...localRouteProps!} />
      </ExecutionDetailsWrapper>
    );
  };
}

export interface ExecutionDetailsRouteParams {
  domainId: string;
  executionId: string;
  projectId: string;
}

export const ExecutionDetails: React.FunctionComponent<
  RouteComponentProps<ExecutionDetailsRouteParams>
> = withRouteParams<ExecutionDetailsRouteParams>(
  withExecutionDetails(ExecutionContainer),
);
