import { Tab, Tabs } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { WaitForQuery } from 'components/common/WaitForQuery';
import { useFetchableData } from 'components/hooks';
import { useConditionalQuery } from 'components/hooks/useConditionalQuery';
import { useTabState } from 'components/hooks/useTabState';
import { every } from 'lodash';
import {
    executionSortFields,
    limits,
    NodeExecution,
    RequestConfig,
    SortDirection,
    TaskExecution,
    TaskExecutionIdentifier
} from 'models';
import * as React from 'react';
import { nodeExecutionIsTerminal } from '..';
import {
    ExecutionDataCacheContext,
    NodeExecutionsRequestConfigContext
} from '../contexts';
import { ExecutionFilters } from '../ExecutionFilters';
import { useNodeExecutionFiltersState } from '../filters/useExecutionFiltersState';
import { makeTaskExecutionChildListQuery } from '../nodeExecutionQueries';
import { NodeExecutionsTable } from '../Tables/NodeExecutionsTable';
import { DetailedNodeExecution } from '../types';
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

interface UseCachedTaskExecutionChildrenArgs {
    config: RequestConfig;
    id: TaskExecutionIdentifier;
}
function useCachedTaskExecutionChildren(
    args: UseCachedTaskExecutionChildrenArgs
) {
    const dataCache = React.useContext(ExecutionDataCacheContext);
    return useFetchableData<
        DetailedNodeExecution[],
        UseCachedTaskExecutionChildrenArgs
    >(
        {
            debugName: 'CachedTaskExecutionChildren',
            defaultValue: [],
            doFetch: ({ id, config }) =>
                dataCache.getTaskExecutionChildren(id, config)
        },
        args
    );
}

/** Contains the content for viewing child NodeExecutions for a TaskExecution */
export const TaskExecutionNodes: React.FC<TaskExecutionNodesProps> = ({
    taskExecution
}) => {
    const styles = useStyles();
    const filterState = useNodeExecutionFiltersState();
    const tabState = useTabState(tabIds, tabIds.nodes);

    const requestConfig = React.useMemo(
        () => ({
            filter: filterState.appliedFilters,
            limit: limits.NONE,
            sort: {
                key: executionSortFields.createdAt,
                direction: SortDirection.ASCENDING
            }
        }),
        [filterState.appliedFilters]
    );

    const shouldEnableQuery = (executions: NodeExecution[]) =>
        every(executions, nodeExecutionIsTerminal) &&
        taskExecutionIsTerminal(taskExecution);

    const nodeExecutionsQuery = useConditionalQuery(
        makeTaskExecutionChildListQuery(taskExecution.id, requestConfig),
        shouldEnableQuery
    );

    const renderNodeExecutionsTable = (nodeExecutions: NodeExecution[]) => (
        <NodeExecutionsRequestConfigContext.Provider value={requestConfig}>
            <NodeExecutionsTable nodeExecutions={nodeExecutions} />
        </NodeExecutionsRequestConfigContext.Provider>
    );

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
                        <WaitForQuery query={nodeExecutionsQuery}>
                            {renderNodeExecutionsTable}
                        </WaitForQuery>
                    </>
                )}
            </div>
        </>
    );
};
