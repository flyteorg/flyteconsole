import { Tab, Tabs } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { WaitForData } from 'components/common';
import { useDataRefresher, useTaskExecutionChildren } from 'components/hooks';
import { useTabState } from 'components/hooks/useTabState';
import { every } from 'lodash';
import {
    executionSortFields,
    limits,
    SortDirection,
    TaskExecution
} from 'models';
import * as React from 'react';
import { executionRefreshIntervalMs, nodeExecutionIsTerminal } from '..';
import { ExecutionFilters } from '../ExecutionFilters';
import { useNodeExecutionFiltersState } from '../filters/useExecutionFiltersState';
import { NodeExecutionsTable } from '../Tables/NodeExecutionsTable';
import { taskExecutionIsTerminal } from '../utils';

const useStyles = makeStyles((theme: Theme) => ({
    filters: {
        paddingLeft: theme.spacing(3)
    },
    nodesContainer: {
        borderTop: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flex: '1 1 100%',
        flexDirection: 'column'
    },
    tabs: {
        paddingLeft: theme.spacing(3.5)
    }
}));

interface TaskExecutionNodesProps {
    taskExecution: TaskExecution;
}

const tabIds = {
    nodes: 'nodes'
};

/** Contains the content for viewing child NodeExecutions for a TaskExecution */
export const TaskExecutionNodes: React.FC<TaskExecutionNodesProps> = ({
    taskExecution
}) => {
    const styles = useStyles();
    const filterState = useNodeExecutionFiltersState();
    const tabState = useTabState(tabIds, tabIds.nodes);
    const sort = {
        key: executionSortFields.createdAt,
        direction: SortDirection.ASCENDING
    };
    // TODO: Does this need to use the execution context?
    const nodeExecutions = useTaskExecutionChildren(taskExecution.id, {
        sort,
        limit: limits.NONE,
        filter: filterState.appliedFilters
    });

    // We will continue to refresh the node executions list as long
    // as either the parent execution or any child is non-terminal
    useDataRefresher(taskExecution.id, nodeExecutions, {
        interval: executionRefreshIntervalMs,
        valueIsFinal: nodeExecutions =>
            every(nodeExecutions, nodeExecutionIsTerminal) &&
            taskExecutionIsTerminal(taskExecution)
    });
    return (
        <>
            <Tabs className={styles.tabs} {...tabState}>
                <Tab value={tabIds.nodes} label="Nodes" />
            </Tabs>
            <div className={styles.nodesContainer}>
                {tabState.value === tabIds.nodes && (
                    <>
                        <div className={styles.filters}>
                            <ExecutionFilters {...filterState} />
                        </div>
                        <WaitForData {...nodeExecutions}>
                            <NodeExecutionsTable
                                {...nodeExecutions}
                                moreItemsAvailable={false}
                            />
                        </WaitForData>
                    </>
                )}
            </div>
        </>
    );
};
