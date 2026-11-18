import { executionSortFields } from './constants';

describe('executionSortFields', () => {
  it('sorts workflow execution lists by execution start time', () => {
    expect(executionSortFields.executionCreatedAt).toBe('execution_created_at');
  });

  it('sorts other entities by their own creation time', () => {
    expect(executionSortFields.createdAt).toBe('created_at');
  });
});
