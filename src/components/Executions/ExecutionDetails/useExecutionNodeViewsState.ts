import { useConditionalQuery } from 'components/hooks/useConditionalQuery';
import { every } from 'lodash';
import {
    Execution,
    executionSortFields,
    FilterOperation,
    limits,
    NodeExecution,
    SortDirection
} from 'models';
import { makeNodeExecutionListQuery } from '../nodeExecutionQueries';
import { executionIsTerminal, nodeExecutionIsTerminal } from '../utils';

export function useExecutionNodeViewsState(
    execution: Execution,
    filter: FilterOperation[] = []
) {
    const sort = {
        key: executionSortFields.createdAt,
        direction: SortDirection.ASCENDING
    };
    const nodeExecutionsRequestConfig = {
        filter,
        sort,
        limit: limits.NONE
    };

    const shouldEnableQuery = (executions: NodeExecution[]) =>
        every(executions, nodeExecutionIsTerminal) &&
        executionIsTerminal(execution);

    const nodeExecutionsQuery = useConditionalQuery(
        makeNodeExecutionListQuery(execution.id, nodeExecutionsRequestConfig),
        shouldEnableQuery
    );

    return { nodeExecutionsQuery, nodeExecutionsRequestConfig };
}
