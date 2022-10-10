import * as React from 'react';
import { render, waitFor } from '@testing-library/react';
import { NodeExecutionDetailsContextProvider } from 'components/Executions/contextProvider/NodeExecutionDetails';
import { mockWorkflowId } from 'mocks/data/fixtures/types';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createTestQueryClient } from 'test/utils';
import { insertFixture } from 'mocks/data/insertFixture';
import { mockServer } from 'mocks/server';
import { basicPythonWorkflow } from 'mocks/data/fixtures/basicPythonWorkflow';
import { NodeExecution } from 'models/Execution/types';
import { NodeExecutionActions } from '../NodeExecutionActions';

jest.mock('components/Workflow/workflowQueries');
const { fetchWorkflow } = require('components/Workflow/workflowQueries');

const state = { selectedExecution: null, setSelectedExeccution: jest.fn() };

describe('Executions > Tables > NodeExecutionActions', () => {
  let queryClient: QueryClient;
  let fixture: ReturnType<typeof basicPythonWorkflow.generate>;
  let execution: NodeExecution;

  beforeEach(() => {
    fixture = basicPythonWorkflow.generate();
    execution = fixture.workflowExecutions.top.nodeExecutions.pythonNode.data;
    queryClient = createTestQueryClient();
    insertFixture(mockServer, fixture);
    fetchWorkflow.mockImplementation(() => Promise.resolve(fixture.workflows.top));
  });

  const renderComponent = (props) =>
    render(
      <QueryClientProvider client={queryClient}>
        <NodeExecutionDetailsContextProvider workflowId={mockWorkflowId}>
          <NodeExecutionActions {...props} />
        </NodeExecutionDetailsContextProvider>
      </QueryClientProvider>,
    );

  it('should render rerun action, if id can be determined', async () => {
    const { queryByTitle } = renderComponent({ execution, state });
    await waitFor(() => queryByTitle('Rerun'));

    expect(queryByTitle('View Inputs & Outputs')).toBeInTheDocument();
    expect(queryByTitle('Rerun')).toBeInTheDocument();
    expect(queryByTitle('Resume')).not.toBeInTheDocument();
  });

  it('should render resume action, if the status is PAUSED', async () => {
    const mockExecution = { ...execution, closure: { phase: 100 } };
    const { queryByTitle } = renderComponent({ execution: mockExecution, state });
    await waitFor(() => queryByTitle('Resume'));

    expect(queryByTitle('View Inputs & Outputs')).toBeInTheDocument();
    expect(queryByTitle('Rerun')).toBeInTheDocument();
    expect(queryByTitle('Resume')).toBeInTheDocument();
  });
});
