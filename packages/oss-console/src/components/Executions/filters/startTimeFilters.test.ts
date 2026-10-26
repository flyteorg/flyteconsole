import {
  nodeExecutionStartTimeFilters,
  workflowExecutionStartTimeFilters,
} from './startTimeFilters';

describe('startTimeFilters', () => {
  it('uses execution timestamps for workflow execution start-time filters', () => {
    expect(workflowExecutionStartTimeFilters.lastHour.data).toEqual([
      expect.objectContaining({
        key: 'execution_created_at',
      }),
    ]);
  });

  it('uses execution timestamps for node execution start-time filters', () => {
    expect(nodeExecutionStartTimeFilters.lastHour.data).toEqual([
      expect.objectContaining({
        key: 'node_execution_created_at',
      }),
    ]);
  });
});
