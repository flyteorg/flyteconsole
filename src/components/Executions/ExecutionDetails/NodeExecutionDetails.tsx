import { IconButton, SvgIconProps, Typography } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Cached from '@material-ui/icons/Cached';
import Close from '@material-ui/icons/Close';
import ErrorOutlined from '@material-ui/icons/ErrorOutlined';
import InfoOutlined from '@material-ui/icons/InfoOutlined';
import * as classnames from 'classnames';
import { assertNever } from 'common/utils';
import { useCommonStyles } from 'components/common/styles';
import { TaskExecutionsList } from 'components/Executions';
import { ExecutionStatusBadge } from 'components/Executions/ExecutionStatusBadge';
import { LocationState } from 'components/hooks/useLocationState';
import { useTabState } from 'components/hooks/useTabState';
import { Core } from 'flyteidl';
import { LocationDescriptor } from 'history';
import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Routes } from 'routes';
import { DetailedNodeExecution, NodeExecutionDisplayType } from '../types';
import { cacheStatusMessages, unknownCacheStatusString } from './constants';
import { NodeExecutionInputs } from './NodeExecutionInputs';
import { NodeExecutionOutputs } from './NodeExecutionOutputs';
import { NodeExecutionTaskDetails } from './NodeExecutionTaskDetails';

const useStyles = makeStyles((theme: Theme) => {
    const paddingVertical = `${theme.spacing(2)}px`;
    const paddingHorizontal = `${theme.spacing(3)}px`;
    return {
        cacheStatus: {
            alignItems: 'center',
            display: 'flex',
            marginTop: theme.spacing(1)
        },
        closeButton: {
            marginLeft: theme.spacing(1)
        },
        container: {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            paddingTop: theme.spacing(2),
            width: '100%'
        },
        content: {
            overflowY: 'auto'
        },
        displayId: {
            marginBottom: theme.spacing(1)
        },
        header: {
            borderBottom: `${theme.spacing(1)}px solid ${theme.palette.divider}`
        },
        headerContent: {
            padding: `0 ${paddingHorizontal} ${paddingVertical} ${paddingHorizontal}`
        },
        nodeTypeContainer: {
            alignItems: 'flex-end',
            borderTop: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            flexDirection: 'row',
            fontWeight: 'bold',
            justifyContent: 'space-between',
            marginTop: theme.spacing(2),
            paddingTop: theme.spacing(2)
        },
        nodeTypeLink: {
            fontWeight: 'normal'
        },
        tabs: {
            borderBottom: `1px solid ${theme.palette.divider}`
        },
        title: {
            alignItems: 'flex-start',
            display: 'flex',
            justifyContent: 'space-between'
        }
    };
});

const tabIds = {
    executions: 'executions',
    inputs: 'inputs',
    outputs: 'outputs',
    task: 'task'
};

const defaultTab = tabIds.executions;

interface NodeExecutionDetailsProps {
    execution: DetailedNodeExecution;
    onClose?: () => void;
}

const NodeExecutionLinkContent: React.FC<{
    execution: DetailedNodeExecution;
}> = ({ execution }) => {
    const commonStyles = useCommonStyles();
    const styles = useStyles();
    useStyles();
    if (execution.displayType === NodeExecutionDisplayType.Workflow) {
        const { workflowNodeMetadata } = execution.closure;
        if (!workflowNodeMetadata) {
            return null;
        }
        const linkTarget: LocationDescriptor<LocationState> = {
            pathname: Routes.ExecutionDetails.makeUrl(
                workflowNodeMetadata.executionId
            ),
            state: {
                backLink: Routes.ExecutionDetails.makeUrl(
                    execution.id.executionId
                )
            }
        };
        return workflowNodeMetadata ? (
            <RouterLink
                className={classnames(
                    commonStyles.primaryLink,
                    styles.nodeTypeLink
                )}
                to={linkTarget}
            >
                View Sub-Workflow
            </RouterLink>
        ) : null;
    }
    return null;
};

const ExecutionTypeDetails: React.FC<{
    execution: DetailedNodeExecution;
}> = ({ execution }) => {
    const styles = useStyles();
    const commonStyles = useCommonStyles();
    return (
        <div
            className={classnames(
                commonStyles.textSmall,
                styles.nodeTypeContainer
            )}
        >
            <div>
                <div
                    className={classnames(
                        commonStyles.microHeader,
                        commonStyles.textMuted
                    )}
                >
                    Type
                </div>
                <div>{execution.displayType}</div>
            </div>
            {<NodeExecutionLinkContent execution={execution} />}
        </div>
    );
};

const CacheStatusIcon: React.FC<SvgIconProps & {
    status: Core.CatalogCacheStatus;
}> = ({ status, ...props }) => {
    switch (status) {
        case Core.CatalogCacheStatus.CACHE_DISABLED:
        case Core.CatalogCacheStatus.CACHE_MISS: {
            return <InfoOutlined {...props} />;
        }
        case Core.CatalogCacheStatus.CACHE_HIT:
        case Core.CatalogCacheStatus.CACHE_POPULATED: {
            return <Cached {...props} />;
        }
        case Core.CatalogCacheStatus.CACHE_LOOKUP_FAILURE:
        case Core.CatalogCacheStatus.CACHE_PUT_FAILURE: {
            return <ErrorOutlined {...props} />;
        }
        default: {
            assertNever(status);
            return null;
        }
    }
};

const NodeExecutionCacheInformation: React.FC<{
    execution: DetailedNodeExecution;
}> = ({
    execution: {
        closure: { taskNodeMetadata }
    }
}) => {
    const commonStyles = useCommonStyles();
    const styles = useStyles();
    if (taskNodeMetadata == null || taskNodeMetadata.cacheStatus == null) {
        return null;
    }

    const message =
        cacheStatusMessages[taskNodeMetadata.cacheStatus] ||
        unknownCacheStatusString;

    return (
        <Typography
            className={styles.cacheStatus}
            variant="subtitle1"
            color="textSecondary"
        >
            <CacheStatusIcon
                status={taskNodeMetadata.cacheStatus}
                className={commonStyles.iconLeft}
            />
            {message}
        </Typography>
    );
};

/** DetailsPanel content which renders execution information about a given NodeExecution
 */
export const NodeExecutionDetails: React.FC<NodeExecutionDetailsProps> = ({
    execution,
    onClose
}) => {
    const tabState = useTabState(tabIds, defaultTab);
    const commonStyles = useCommonStyles();
    const styles = useStyles();
    const showTaskDetails = !!execution.taskTemplate;

    // Reset to default tab when we change executions
    React.useEffect(() => {
        tabState.onChange({}, defaultTab);
    }, [execution.cacheKey]);

    const statusContent = (
        <ExecutionStatusBadge phase={execution.closure.phase} type="node" />
    );

    // TODO: Switch based on node type
    const executionDetailsContent = (
        <TaskExecutionsList nodeExecution={execution} />
    );

    return (
        <section className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <Typography
                        className={classnames(
                            commonStyles.textWrapped,
                            styles.title
                        )}
                        variant="h3"
                    >
                        {execution.id.nodeId}
                        <IconButton
                            className={styles.closeButton}
                            onClick={onClose}
                            size="small"
                        >
                            <Close />
                        </IconButton>
                    </Typography>
                    <Typography
                        className={classnames(
                            commonStyles.textWrapped,
                            styles.displayId
                        )}
                        variant="subtitle1"
                        color="textSecondary"
                    >
                        {execution.displayId}
                    </Typography>
                    {statusContent}
                    <NodeExecutionCacheInformation execution={execution} />
                    <ExecutionTypeDetails execution={execution} />
                </div>
            </header>
            <Tabs {...tabState} className={styles.tabs}>
                <Tab value={tabIds.executions} label="Executions" />
                {execution && <Tab value={tabIds.inputs} label="Inputs" />}
                {execution && <Tab value={tabIds.outputs} label="Outputs" />}
                {showTaskDetails && <Tab value={tabIds.task} label="Task" />}
            </Tabs>
            <div className={styles.content}>
                {tabState.value === tabIds.executions &&
                    executionDetailsContent}
                {tabState.value === tabIds.inputs && (
                    <NodeExecutionInputs execution={execution} />
                )}
                {tabState.value === tabIds.outputs && (
                    <NodeExecutionOutputs execution={execution} />
                )}
                {tabState.value === tabIds.task && (
                    <NodeExecutionTaskDetails execution={execution} />
                )}
            </div>
        </section>
    );
};
