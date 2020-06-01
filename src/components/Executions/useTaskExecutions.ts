import { APIContextValue, useAPIContext } from 'components/data/apiContext';
import { every } from 'lodash';
import {
    ExecutionData,
    limits,
    NodeExecution,
    NodeExecutionIdentifier,
    SortDirection,
    TaskExecution,
    TaskExecutionIdentifier,
    taskSortFields
} from 'models';
import { useDataRefresher } from '../hooks';
import { FetchableData } from '../hooks/types';
import { useFetchableData } from '../hooks/useFetchableData';
import { executionRefreshIntervalMs } from './constants';
import { nodeExecutionIsTerminal, taskExecutionIsTerminal } from './utils';

export const fetchTaskExecutions = async (
    id: NodeExecutionIdentifier,
    apiContext: APIContextValue
) => {
    const { listTaskExecutions } = apiContext;
    const { entities } = await listTaskExecutions(id, {
        limit: limits.NONE,
        sort: {
            key: taskSortFields.createdAt,
            direction: SortDirection.ASCENDING
        }
    });
    return entities;
};

/** A hook for fetching the list of TaskExecutions associated with a
 * NodeExecution
 */
export function useTaskExecutions(
    id: NodeExecutionIdentifier
): FetchableData<TaskExecution[]> {
    const apiContext = useAPIContext();
    return useFetchableData<TaskExecution[], NodeExecutionIdentifier>(
        {
            debugName: 'TaskExecutions',
            defaultValue: [],
            doFetch: async (id: NodeExecutionIdentifier) =>
                fetchTaskExecutions(id, apiContext)
        },
        id
    );
}

/** Fetches the signed URLs for TaskExecution data (inputs/outputs) */
export function useTaskExecutionData(
    id: TaskExecutionIdentifier
): FetchableData<ExecutionData> {
    const { getTaskExecutionData } = useAPIContext();
    return useFetchableData<ExecutionData, TaskExecutionIdentifier>(
        {
            debugName: 'TaskExecutionData',
            defaultValue: {} as ExecutionData,
            doFetch: id => getTaskExecutionData(id)
        },
        id
    );
}

export function useTaskExecutionsRefresher(
    nodeExecution: NodeExecution,
    taskExecutionsFetchable: ReturnType<typeof useTaskExecutions>
) {
    return useDataRefresher(nodeExecution.id, taskExecutionsFetchable, {
        interval: executionRefreshIntervalMs,
        valueIsFinal: taskExecutions =>
            every(taskExecutions, taskExecutionIsTerminal) &&
            nodeExecutionIsTerminal(nodeExecution)
    });
}
