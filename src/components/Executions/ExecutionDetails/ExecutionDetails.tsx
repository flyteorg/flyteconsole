import { Collapse, IconButton } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import ExpandMore from '@material-ui/icons/ExpandMore';
import * as classnames from 'classnames';
import { withRouteParams } from 'components/common';
import { WaitForQuery } from 'components/common/WaitForQuery';
import { useAPIContext } from 'components/data/apiContext';
import { RefreshConfig } from 'components/hooks';
import { Execution } from 'models';
import * as React from 'react';
import { executionRefreshIntervalMs } from '../constants';
import { ExecutionContext, ExecutionDataCacheContext } from '../contexts';
import { useExecutionDataCache } from '../useExecutionDataCache';
import { useWorkflowExecutionQuery } from '../useWorkflowExecution';
import { executionIsTerminal } from '../utils';
import { ExecutionDetailsAppBarContent } from './ExecutionDetailsAppBarContent';
import { ExecutionMetadata } from './ExecutionMetadata';
import { ExecutionNodeViews } from './ExecutionNodeViews';

const useStyles = makeStyles((theme: Theme) => ({
    expandCollapseButton: {
        transition: theme.transitions.create('transform'),
        '&.expanded': {
            transform: 'rotate(180deg)'
        }
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
        zIndex: 1
    },
    metadataContainer: {
        position: 'relative'
    }
}));

export interface ExecutionDetailsRouteParams {
    domainId: string;
    executionId: string;
    projectId: string;
}
export type ExecutionDetailsProps = ExecutionDetailsRouteParams;

const executionRefreshConfig: RefreshConfig<Execution> = {
    interval: executionRefreshIntervalMs,
    valueIsFinal: executionIsTerminal
};

interface RenderExecutionDetailsProps {
    execution: Execution;
}

const RenderExecutionDetails: React.FC<RenderExecutionDetailsProps> = ({
    execution
}) => {
    const styles = useStyles();
    const [metadataExpanded, setMetadataExpanded] = React.useState(true);
    const toggleMetadata = () => setMetadataExpanded(!metadataExpanded);
    const dataCache = useExecutionDataCache();
    const { terminateWorkflowExecution } = useAPIContext();

    // TODO: Move this to where the button actually lives, use a queryCache mutator
    // so that consumers of the execution automatically update.
    const terminateExecution = async (cause: string) => {
        await terminateWorkflowExecution(execution.id, cause);
    };
    const contextValue = {
        terminateExecution,
        execution
    };

    return (
        <ExecutionContext.Provider value={contextValue}>
            <ExecutionDetailsAppBarContent execution={execution} />
            <div className={styles.metadataContainer}>
                <Collapse in={metadataExpanded}>
                    <ExecutionMetadata execution={execution} />
                </Collapse>
                <div className={styles.expandCollapseContainer}>
                    <IconButton size="small" onClick={toggleMetadata}>
                        <ExpandMore
                            className={classnames(styles.expandCollapseButton, {
                                expanded: metadataExpanded
                            })}
                        />
                    </IconButton>
                </div>
            </div>
            <ExecutionDataCacheContext.Provider value={dataCache}>
                <ExecutionNodeViews execution={execution} />
            </ExecutionDataCacheContext.Provider>
        </ExecutionContext.Provider>
    );
};

/** The view component for the Execution Details page */
export const ExecutionDetailsContainer: React.FC<ExecutionDetailsProps> = ({
    executionId,
    domainId,
    projectId
}) => {
    const id = {
        project: projectId,
        domain: domainId,
        name: executionId
    };

    const renderExecutionDetails = (execution: Execution) => (
        <RenderExecutionDetails execution={execution} />
    );

    return (
        <WaitForQuery query={useWorkflowExecutionQuery(id)}>
            {renderExecutionDetails}
        </WaitForQuery>
    );
};

export const ExecutionDetails = withRouteParams<ExecutionDetailsRouteParams>(
    ExecutionDetailsContainer
);
