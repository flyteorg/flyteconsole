import * as React from 'react';
import { render, waitFor } from '@testing-library/react';
import { noExecutionsFoundString } from 'common/constants';
import { APIContext } from 'components/data/apiContext';
import { mockAPIContextValue } from 'components/data/__mocks__/apiContext';
import { listTaskExecutions } from 'models/Execution/api';
import { NodeExecution } from 'models/Execution/types';
import { mockNodeExecutionResponse } from 'models/Execution/__mocks__/mockNodeExecutionsData';
import { TaskExecutionsList } from '../TaskExecutionsList';
import { MockPythonTaskExecution } from '../TaskExecutions.mocks';

describe('TaskExecutionsList', () => {
  let nodeExecution: NodeExecution;
  let mockListTaskExecutions: jest.Mock<ReturnType<typeof listTaskExecutions>>;

  const renderList = () =>
    render(
      <APIContext.Provider
        value={mockAPIContextValue({
          listTaskExecutions: mockListTaskExecutions,
        })}
      >
        <TaskExecutionsList
          nodeExecution={nodeExecution}
          onTaskSelected={jest.fn()}
        />
      </APIContext.Provider>,
    );
  beforeEach(() => {
    nodeExecution = { ...mockNodeExecutionResponse } as NodeExecution;
    mockListTaskExecutions = jest.fn().mockResolvedValue({ entities: [] });
  });

  it('Renders message when no task executions exist', async () => {
    const { queryByText } = renderList();
    await waitFor(() => {});
    expect(queryByText(noExecutionsFoundString)).toBeInTheDocument();
  });

  it('Renders tasks when task executions exist', async () => {
    nodeExecution = {
      ...mockNodeExecutionResponse,
      startedAt: '2021-01-01T00:00:00Z',
      taskExecutions: [MockPythonTaskExecution],
    } as NodeExecution;

    const { queryByText } = renderList();
    await waitFor(() => {});
    expect(queryByText('Attempt 01')).toBeInTheDocument();
    expect(queryByText('Succeeded')).toBeInTheDocument();
  });
});
