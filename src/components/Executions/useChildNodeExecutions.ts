import { APIContextValue, useAPIContext } from 'components/data/apiContext';
import {
    FetchableData,
    fetchNodeExecutions,
    fetchTaskExecutionChildren
} from 'components/hooks';
import { useFetchableData } from 'components/hooks/useFetchableData';
import { isEqual } from 'lodash';
import {
    Execution,
    NodeExecution,
    RequestConfig,
    TaskExecutionIdentifier,
    WorkflowExecutionIdentifier
} from 'models';
import { formatRetryAttempt } from './TaskExecutionsList/utils';
import { NodeExecutionGroup } from './types';
import { fetchTaskExecutions } from './useTaskExecutions';

interface FetchGroupForTaskExecutionArgs {
    apiContext: APIContextValue;
    config: RequestConfig;
    taskExecutionId: TaskExecutionIdentifier;
}
async function fetchGroupForTaskExecution({
    apiContext,
    config,
    taskExecutionId
}: FetchGroupForTaskExecutionArgs): Promise<NodeExecutionGroup> {
    return {
        // NodeExecutions created by a TaskExecution are grouped
        // by the retry attempt of the task.
        name: formatRetryAttempt(taskExecutionId.retryAttempt),
        nodeExecutions: await fetchTaskExecutionChildren(
            { config, taskExecutionId },
            apiContext
        )
    };
}

interface FetchGroupForWorkflowExecutionArgs {
    apiContext: APIContextValue;
    config: RequestConfig;
    workflowExecutionId: WorkflowExecutionIdentifier;
}
async function fetchGroupForWorkflowExecution({
    apiContext,
    config,
    workflowExecutionId
}: FetchGroupForWorkflowExecutionArgs): Promise<NodeExecutionGroup> {
    return {
        // NodeExecutions created by a workflow execution are grouped
        // by the execution id, since workflow executions are not retryable.
        name: workflowExecutionId.name,
        nodeExecutions: await fetchNodeExecutions(
            { config, id: workflowExecutionId },
            apiContext
        )
    };
}

interface FetchNodeExecutionGroupArgs {
    apiContext: APIContextValue;
    config: RequestConfig;
    nodeExecution: NodeExecution;
}

async function fetchGroupsForTaskExecutionNode({
    apiContext,
    config,
    nodeExecution: { id: nodeExecutionId }
}: FetchNodeExecutionGroupArgs): Promise<NodeExecutionGroup[]> {
    const taskExecutions = await fetchTaskExecutions(
        nodeExecutionId,
        apiContext
    );

    const groups = await Promise.all(
        taskExecutions.map(execution =>
            execution.isParent
                ? fetchGroupForTaskExecution({
                      apiContext,
                      config,
                      taskExecutionId: execution.id
                  })
                : Promise.resolve(null)
        )
    );

    return groups.reduce<NodeExecutionGroup[]>((out, group) => {
        if (group === null || group.nodeExecutions.length === 0) {
            return out;
        }
        return [...out, group];
    }, []);
}

async function fetchGroupsForWorkflowExecutionNode({
    apiContext,
    config,
    nodeExecution
}: FetchNodeExecutionGroupArgs): Promise<NodeExecutionGroup[]> {
    if (!nodeExecution.closure.workflowNodeMetadata) {
        throw new Error('Unexpected empty `workflowNodeMetadata`');
    }
    const {
        executionId: workflowExecutionId
    } = nodeExecution.closure.workflowNodeMetadata;
    // We can only have one WorkflowExecution (no retries), so there is only
    // one group to return. But calling code expects it as an array.
    const group = await fetchGroupForWorkflowExecution({
        apiContext,
        config,
        workflowExecutionId
    });
    return group.nodeExecutions.length > 0 ? [group] : [];
}

export interface UseChildNodeExecutionsArgs {
    requestConfig: RequestConfig;
    nodeExecution: NodeExecution;
    workflowExecution: Execution;
}

/** Fetches and groups `NodeExecution`s which are direct children of the given
 * `NodeExecution`.
 */
export function useChildNodeExecutions({
    nodeExecution,
    requestConfig,
    workflowExecution
}: UseChildNodeExecutionsArgs): FetchableData<NodeExecutionGroup[]> {
    const apiContext = useAPIContext();
    const { workflowNodeMetadata } = nodeExecution.closure;
    return useFetchableData<NodeExecutionGroup[], NodeExecution>(
        {
            debugName: 'ChildNodeExecutions',
            defaultValue: [],
            doFetch: async data => {
                const fetchArgs = {
                    apiContext,
                    config: requestConfig,
                    nodeExecution: data
                };
                // Nested NodeExecutions will sometimes have `workflowNodeMetadata` that
                // points to the parent WorkflowExecution. We're only interested in
                // showing children if this node is a sub-workflow.
                if (
                    workflowNodeMetadata &&
                    !isEqual(
                        workflowNodeMetadata.executionId,
                        workflowExecution.id
                    )
                ) {
                    return fetchGroupsForWorkflowExecutionNode(fetchArgs);
                }
                return fetchGroupsForTaskExecutionNode(fetchArgs);
            }
        },
        nodeExecution
    );
}
