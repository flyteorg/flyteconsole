import { APIContextValue, useAPIContext } from 'components/data/apiContext';
import {
    fetchNodeExecutions,
    fetchTaskExecutionChildren
} from 'components/hooks';
import { useFetchableData } from 'components/hooks/useFetchableData';
import { isEqual } from 'lodash';
import {
    NodeExecution,
    NodeExecutionIdentifier,
    RequestConfig,
    TaskExecutionIdentifier,
    WorkflowExecutionIdentifier
} from 'models';
import * as React from 'react';
import { ExecutionContext } from './ExecutionDetails/contexts';
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
    // TODO: It's possible that one of these promises fails while the
    // others succeed. We might want to handle that in a way that
    // allows the user to see the groups that loaded, and maybe
    // retry the ones that did not.
    return await Promise.all(
        taskExecutions.map(({ id: taskExecutionId }) =>
            fetchGroupForTaskExecution({ apiContext, config, taskExecutionId })
        )
    );
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
    return [
        await fetchGroupForWorkflowExecution({
            apiContext,
            config,
            workflowExecutionId
        })
    ];
}

export function useChildNodeExecutions(
    nodeExecution: NodeExecution,
    config: RequestConfig
) {
    const apiContext = useAPIContext();
    const { workflowNodeMetadata } = nodeExecution.closure;
    const { execution: topExecution } = React.useContext(ExecutionContext);
    return useFetchableData<NodeExecutionGroup[], NodeExecutionIdentifier>(
        {
            debugName: 'ChildNodeExecutions',
            defaultValue: [],
            doFetch: async () => {
                const fetchArgs = {
                    apiContext,
                    config,
                    nodeExecution
                };
                // Nested NodeExecutions will sometimes have `workflowNodeMetadata` that
                // points to the parent WorkflowExecution. We're only interested in
                // showing children if this node is a sub-workflow.
                if (
                    workflowNodeMetadata &&
                    !isEqual(workflowNodeMetadata.executionId, topExecution.id)
                ) {
                    return fetchGroupsForWorkflowExecutionNode(fetchArgs);
                }
                return fetchGroupsForTaskExecutionNode(fetchArgs);
            }
        },
        nodeExecution.id
    );
}
