import * as React from 'react';
import { formatDateUTC, millisecondsToHMS } from '../../common/formatters';
import { timestampToDate } from '../../common/utils';
import { Execution } from '../../models/Execution/types';
import { getPhaseConstants } from '../Executions/ExecutionStatusBadge';
import { getWorkflowExecutionTimingMS } from '../Executions/utils';
import { getExecutionStatusClassName } from '../utils/classes';

export const getExecutionTimeData = (
  executions: Execution[],
  resourceType: 'node' | 'workflow' | 'task',
) => {
  const fillSize = 100;
  const newExecutions = [...executions].reverse().map((execution) => {
    const duration = getWorkflowExecutionTimingMS(execution)?.duration || 1;
    const statusText = getPhaseConstants(resourceType, execution.closure.phase).text;
    return {
      value: duration,
      className: getExecutionStatusClassName('background', execution.closure.phase),
      metadata: execution.id,
      tooltip: (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span>
            Execution Id: <strong>{execution.id.name}</strong>
          </span>
          <span>Status: {statusText}</span>
          <span>Running time: {millisecondsToHMS(duration)}</span>
          <span>
            Started at:
            {execution?.closure?.startedAt &&
              formatDateUTC(timestampToDate(execution.closure.startedAt))}
          </span>
        </div>
      ),
    };
  });
  if (newExecutions.length >= fillSize) {
    return newExecutions.slice(0, fillSize);
  }
  return new Array(fillSize - newExecutions.length)
    .fill(0)
    .map(() => ({
      value: 1,
      // gets the default color for the status
      className: getExecutionStatusClassName('background'),
    }))
    .concat(newExecutions);
};

export const getStartExecutionTime = (executions: Execution[]) => {
  if (executions.length === 0) {
    return '';
  }
  const lastExecution = executions[executions.length - 1];
  if (!lastExecution?.closure?.startedAt) {
    return '';
  }
  return formatDateUTC(timestampToDate(lastExecution?.closure?.startedAt));
};
