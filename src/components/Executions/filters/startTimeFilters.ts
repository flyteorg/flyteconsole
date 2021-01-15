import { FilterOperationName } from 'models/AdminEntity/types';
import { FilterMap } from './types';
import moment = require('moment');

const workflowExecutionStartTimeKey = 'execution_created_at';
const nodeExecutionStartTimeKey = 'node_execution_created_at';

export type StartTimeFilterKey =
    | 'all'
    | 'lastHour'
    | 'today'
    | 'yesterday'
    | 'thisWeek'
    | 'thisMonth'
    | 'lastMonth'
    | 'thisYear'
    | 'lastYear';

/** A set of WorkflowExecution start time filters to be consumed by a SingleFilterState.
 * Start time values are generated as ISO date strings
 */
export function startTimeFilters(key: string): FilterMap<StartTimeFilterKey> {
    return {
        all: { label: 'All Time', value: 'all', data: [] },
        lastHour: {
            label: 'Last Hour',
            value: 'lastHour',
            data: [
                {
                    key,
                    operation: FilterOperationName.GTE,
                    value: () =>
                        moment()
                            .subtract(1, 'hour')
                            .toISOString()
                }
            ]
        },
        today: {
            label: 'Today',
            value: 'today',
            data: [
                {
                    key,
                    operation: FilterOperationName.GTE,
                    value: () =>
                        moment()
                            .startOf('day')
                            .toISOString()
                }
            ]
        },
        yesterday: {
            label: 'Yesterday',
            value: 'yesterday',
            data: [
                {
                    key,
                    operation: FilterOperationName.GTE,
                    value: () =>
                        moment()
                            .startOf('day')
                            .subtract(1, 'day')
                            .toISOString()
                },
                {
                    key,
                    operation: FilterOperationName.LTE,
                    value: () =>
                        moment()
                            .startOf('day')
                            .toISOString()
                }
            ]
        },
        thisWeek: {
            label: 'This Week',
            value: 'thisWeek',
            data: [
                {
                    key,
                    operation: FilterOperationName.GTE,
                    value: () =>
                        moment()
                            .startOf('week')
                            .toISOString()
                }
            ]
        },
        thisMonth: {
            label: 'This Month',
            value: 'thisMonth',
            data: [
                {
                    key,
                    operation: FilterOperationName.GTE,
                    value: () =>
                        moment()
                            .startOf('month')
                            .toISOString()
                }
            ]
        },
        lastMonth: {
            label: 'Last Month',
            value: 'lastMonth',
            data: [
                {
                    key,
                    operation: FilterOperationName.GTE,
                    value: () =>
                        moment()
                            .startOf('month')
                            .subtract(1, 'month')
                            .toISOString()
                },
                {
                    key,
                    operation: FilterOperationName.LTE,
                    value: () =>
                        moment()
                            .startOf('month')
                            .toISOString()
                }
            ]
        },
        thisYear: {
            label: 'This Year',
            value: 'thisYear',
            data: [
                {
                    key,
                    operation: FilterOperationName.GTE,
                    value: () =>
                        moment()
                            .startOf('year')
                            .toISOString()
                }
            ]
        },
        lastYear: {
            label: 'Last Year',
            value: 'lastYear',
            data: [
                {
                    key,
                    operation: FilterOperationName.GTE,
                    value: () =>
                        moment()
                            .startOf('year')
                            .subtract(1, 'year')
                            .toISOString()
                },
                {
                    key,
                    operation: FilterOperationName.LTE,
                    value: () =>
                        moment()
                            .startOf('year')
                            .toISOString()
                }
            ]
        }
    };
}

export const workflowExecutionStartTimeFilters = startTimeFilters(
    workflowExecutionStartTimeKey
);
export const nodeExecutionStartTimeFilters = startTimeFilters(
    nodeExecutionStartTimeKey
);
