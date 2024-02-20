import { render, waitFor } from '@testing-library/react';
import * as React from 'react';
import {
  QueryClient,
  QueryClientProvider as QueryClientProviderImport,
  QueryClientProviderProps,
} from 'react-query';
import { MemoryRouter } from 'react-router';
import cloneDeep from 'lodash/cloneDeep';
import { cacheStatusMessages } from '../constants';
import { basicPythonWorkflow } from '../../../mocks/data/fixtures/basicPythonWorkflow';
import { insertFixture } from '../../../mocks/data/insertFixture';
import { mockServer } from '../../../mocks/server';
import { CatalogCacheStatus } from '../../../models/Execution/enums';
import { NodeExecution } from '../../../models/Execution/types';
import { createTestQueryClient } from '../../../test/utils';
import { createWorkflowObject } from '../../../models/__mocks__/workflowData';
import { NodeExecutionCacheStatus } from '../NodeExecutionCacheStatus';
import { NodeExecutionDetailsContextProvider } from '../contextProvider/NodeExecutionDetails/NodeExecutionDetailsContextProvider';

const workflow = createWorkflowObject();

const QueryClientProvider: React.FC<React.PropsWithChildren<QueryClientProviderProps>> =
  QueryClientProviderImport;

jest.mock('../../../models/Task/utils');
jest.mock('../../../queries/workflowQueries');
const { fetchWorkflow } = require('../../../queries/workflowQueries');

// TODO add test to cover mapTask branch
describe('Executions > NodeExecutionCacheStatus', () => {
  let fixture: ReturnType<typeof basicPythonWorkflow.generate>;
  let execution: NodeExecution;
  let queryClient: QueryClient;

  beforeEach(() => {
    fixture = basicPythonWorkflow.generate();
    insertFixture(mockServer, fixture);
    execution = fixture.workflowExecutions.top.nodeExecutions.pythonNode.data;
    fetchWorkflow.mockImplementation(() => Promise.resolve(fixture.workflows.top));
    queryClient = createTestQueryClient();
  });

  const renderComponent = (props) =>
    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <NodeExecutionDetailsContextProvider initialWorkflow={workflow}>
            <NodeExecutionCacheStatus {...props} />
          </NodeExecutionDetailsContextProvider>
        </QueryClientProvider>
      </MemoryRouter>,
    );

  it('should not render anything, if cacheStatus is undefined', async () => {
    const ex = cloneDeep(execution);
    const { container } = renderComponent({ execution: ex });
    await waitFor(() => container);

    expect(container).toBeEmptyDOMElement();
  });

  it('should not render anything, if cacheStatus is null', async () => {
    const mockExecution = {
      ...execution,
      closure: { taskNodeMetadata: { cacheStatus: null } },
    };
    const { container } = renderComponent({ execution: mockExecution });
    await waitFor(() => container);

    expect(container).toBeEmptyDOMElement();
  });

  it('should render cache hit status text, if execution has cacheStatus CACHE_HIT', async () => {
    const cacheStatus = CatalogCacheStatus.CACHE_HIT;
    const mockExecution = {
      ...execution,
      closure: { taskNodeMetadata: { cacheStatus } },
    };
    const { queryByText } = renderComponent({ execution: mockExecution });
    await waitFor(() => queryByText(cacheStatusMessages[cacheStatus]));

    expect(queryByText(cacheStatusMessages[cacheStatus])).toBeInTheDocument();
  });
});
