import * as React from 'react';
import { render, waitFor } from '@testing-library/react';
import { muiTheme } from '@clients/theme/Theme/muiTheme';
import { ThemeProvider } from '@mui/material/styles';
import { MemoryRouter } from 'react-router';
import { noExecutionsFoundString } from '@clients/common/constants';
import { QueryClient, QueryClientProvider } from 'react-query';
import * as executionsApi from '../../../../models/Execution/api';
import { NodeExecution } from '../../../../models/Execution/types';
import { mockNodeExecutionResponse } from '../../../../models/Execution/__mocks__/mockNodeExecutionsData';
import { TaskExecutionsList } from '../TaskExecutionsList';
import { MockPythonTaskExecution } from '../TaskExecutions.mocks';
import { createTestQueryClient } from '../../../../test/utils';

jest.mock('../../../../models/Execution/api', () => ({
  listTaskExecutions: jest.fn(),
}));

describe('TaskExecutionsList', () => {
  let nodeExecution: NodeExecution;
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    nodeExecution = { ...mockNodeExecutionResponse } as NodeExecution;
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderList = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ThemeProvider theme={muiTheme}>
            <TaskExecutionsList nodeExecution={nodeExecution!} onTaskSelected={jest.fn()} />
          </ThemeProvider>
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  it('Renders message when no task executions exist', async () => {
    const mockListProjects = jest.spyOn(executionsApi, 'listTaskExecutions');

    mockListProjects.mockResolvedValue({ entities: [] });

    const { queryByText } = renderList();
    await waitFor(() => {});
    await waitFor(() => expect(queryByText(noExecutionsFoundString)).toBeInTheDocument());
  });

  it('Renders tasks when task executions exist', async () => {
    nodeExecution = {
      ...mockNodeExecutionResponse,
      startedAt: '2021-01-01T00:00:00Z',
    } as NodeExecution;
    const mockListProjects = jest.spyOn(executionsApi, 'listTaskExecutions');

    mockListProjects.mockResolvedValue({ entities: [MockPythonTaskExecution] });

    const { queryByText } = renderList();
    await waitFor(() => {});
    await waitFor(() => expect(queryByText('Attempt 01')).toBeInTheDocument());
    await waitFor(() => expect(queryByText('Succeeded')).toBeInTheDocument());
  });
});
