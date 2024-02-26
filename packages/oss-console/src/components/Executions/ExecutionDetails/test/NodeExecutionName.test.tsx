import * as React from 'react';
import { render, waitFor } from '@testing-library/react';
import {
  QueryClient,
  QueryClientProvider as QueryClientProviderImport,
  QueryClientProviderProps,
} from 'react-query';
import { createTestQueryClient } from '../../../../test/utils';
import { insertFixture } from '../../../../mocks/data/insertFixture';
import { mockServer } from '../../../../mocks/server';
import { basicPythonWorkflow } from '../../../../mocks/data/fixtures/basicPythonWorkflow';
import { createWorkflowObject } from '../../../../models/__mocks__/workflowData';
import { NodeExecutionName } from '../Timeline/NodeExecutionName';
import { NodeExecutionDetailsContextProvider } from '../../contextProvider/NodeExecutionDetails/NodeExecutionDetailsContextProvider';

const workflow = createWorkflowObject();

const QueryClientProvider: React.FC<React.PropsWithChildren<QueryClientProviderProps>> =
  QueryClientProviderImport;

jest.mock('../../../../queries/workflowQueries');
const { fetchWorkflow } = require('../../../../queries/workflowQueries');

const templateName = 'basics.hello_world.hello_world_wf';

describe('Executions > ExecutionDetails > NodeExecutionName', () => {
  let queryClient: QueryClient;
  let fixture: ReturnType<typeof basicPythonWorkflow.generate>;

  beforeEach(() => {
    fixture = basicPythonWorkflow.generate();
    queryClient = createTestQueryClient();
    insertFixture(mockServer, fixture);
    fetchWorkflow.mockImplementation(() => Promise.resolve(fixture.workflows.top));
  });

  const renderComponent = (props) =>
    render(
      <QueryClientProvider client={queryClient}>
        <NodeExecutionDetailsContextProvider initialWorkflow={workflow}>
          <NodeExecutionName {...props} />
        </NodeExecutionDetailsContextProvider>
      </QueryClientProvider>,
    );

  it('should only display node name if template is not provided', async () => {
    const resultName = 'say_hello';
    const { queryByText } = renderComponent({ node: { name: resultName } });
    await waitFor(() => {
      expect(queryByText(resultName)).toBeInTheDocument();
    });

    expect(queryByText(templateName)).not.toBeInTheDocument();
  });
});
