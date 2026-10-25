import { executionSortFields } from './constants';

describe('executionSortFields', () => {
  it('sorts workflow execution lists by execution start time', () => {
    expect(executionSortFields.createdAt).toBe('execution_created_at');
  });
});
