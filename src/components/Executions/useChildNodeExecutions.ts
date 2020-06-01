import { APIContextValue, useAPIContext } from 'components/data/apiContext';
import { fetchTaskExecutionChildren } from 'components/hooks';
import { useFetchableData } from 'components/hooks/useFetchableData';
import { NodeExecutionIdentifier, RequestConfig, TaskExecution } from 'models';
import { NodeExecutionGroup } from './types';
import { fetchTaskExecutions } from './useTaskExecutions';

const fetchDetailedNodeExecutionsGroup = async (
    parentTaskExecution: TaskExecution,
    config: RequestConfig,
    apiContext: APIContextValue
) => ({
    parentTaskExecution,
    nodeExecutions: await fetchTaskExecutionChildren(
        { config, taskExecutionId: parentTaskExecution.id },
        apiContext
    )
});

export function useChildNodeExecutions(
    id: NodeExecutionIdentifier,
    config: RequestConfig
) {
    const apiContext = useAPIContext();

    // useTaskExecutions followed by useTaskExecutionChildren
    // Need a way to compose fetchables, because we want the caching
    // logic to be used in each of them
    return useFetchableData<NodeExecutionGroup[], NodeExecutionIdentifier>(
        {
            debugName: 'ChildNodeExecutions',
            defaultValue: [],
            doFetch: async (id: NodeExecutionIdentifier) => {
                const taskExecutions = await fetchTaskExecutions(
                    id,
                    apiContext
                );
                // TODO: It's possible that one of these promises fails while the
                // others succeed. We might want to handle that in a way that
                // allows the user to see the groups that loaded, and maybe
                // retry the ones that did not.
                return await Promise.all(
                    taskExecutions.map(taskExecution =>
                        fetchDetailedNodeExecutionsGroup(
                            taskExecution,
                            config,
                            apiContext
                        )
                    )
                );
            }
        },
        id
    );
}
