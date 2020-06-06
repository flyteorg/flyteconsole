import {
    useDataRefresher,
    useNodeExecutions,
    useWorkflow
} from 'components/hooks';
import { every } from 'lodash';
import {
    Execution,
    executionSortFields,
    FilterOperation,
    limits,
    SortDirection
} from 'models';
import { useContext } from 'react';
import {
    executionIsTerminal,
    executionRefreshIntervalMs,
    nodeExecutionIsTerminal
} from '.';
import { ExecutionContext } from './contexts';
import { useDetailedNodeExecutions } from './useDetailedNodeExecutions';

/** Fetches both the workflow and nodeExecutions for a given WorkflowExecution.
 * Will also map node details to the node executions.
 */
export function useWorkflowExecutionState(
    execution: Execution,
    filter: FilterOperation[] = []
) {
    // const { dataCache } = useContext(ExecutionContext);
    const sort = {
        key: executionSortFields.createdAt,
        direction: SortDirection.ASCENDING
    };
    const nodeExecutionsRequestConfig = {
        filter,
        sort,
        limit: limits.NONE
    };
    const rawNodeExecutions = useNodeExecutions(
        execution.id,
        nodeExecutionsRequestConfig
    );

    // TODO: This needs to either:
    // 1: Wait for the workflow by wrapping dataCache.getWorkflow in a fetchable
    // 2. Move all of the data fetching here into a separate hook that can compose
    //    the bare promises together.
    // 3. Stop decorating NodeExecutions here and do it in the row component instead.
    const workflow = useWorkflow(execution.closure.workflowId);
    const nodeExecutions = useDetailedNodeExecutions(
        rawNodeExecutions,
        workflow
    );

    // We will continue to refresh the node executions list as long
    // as either the parent execution or any child is non-terminal
    useDataRefresher(execution.id, nodeExecutions, {
        interval: executionRefreshIntervalMs,
        valueIsFinal: nodeExecutions =>
            every(nodeExecutions, nodeExecutionIsTerminal) &&
            executionIsTerminal(execution)
    });

    return { workflow, nodeExecutions, nodeExecutionsRequestConfig };
}
