import { render, waitFor } from '@testing-library/react';
import { cacheStatusMessages } from 'components/Executions/constants';
import { NodeExecutionDetailsContextProvider } from 'components/Executions/contextProvider/NodeExecutionDetails';
import { basicPythonWorkflow } from 'mocks/data/fixtures/basicPythonWorkflow';
import { mockWorkflowId } from 'mocks/data/fixtures/types';
import { insertFixture } from 'mocks/data/insertFixture';
import { mockServer } from 'mocks/server';
import { CatalogCacheStatus } from 'models/Execution/enums';
import { NodeExecution } from 'models/Execution/types';
import { TaskType } from 'models/Task/constants';
// import { isMapTaskType } from 'models/Task/utils';
import * as React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router';
import { createTestQueryClient } from 'test/utils';
import { NodeExecutionCacheStatus } from '../NodeExecutionCacheStatus';

jest.mock('models/Task/utils');
jest.mock('components/Workflow/workflowQueries');
const { fetchWorkflow } = require('components/Workflow/workflowQueries');

describe('Executions > NodeExecutionCacheStatus', () => {
  // const mockIsMapTaskType = isMapTaskType as jest.Mock<ReturnType<typeof isMapTaskType>>;
  // mockIsMapTaskType.mockReturnValue(false);

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
          <NodeExecutionDetailsContextProvider workflowId={mockWorkflowId}>
            <NodeExecutionCacheStatus {...props} />
          </NodeExecutionDetailsContextProvider>
        </QueryClientProvider>
      </MemoryRouter>,
    );

  it('should not render anything, if cacheStatus is undefined', async () => {
    const { container } = renderComponent({ execution });
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

  it.only('should render map task status text, if execution is map task', async () => {
    const mockUseContext: jest.SpyInstance = jest.spyOn(React, 'useContext');

    // mockIsMapTaskType.mockReturnValueOnce(true);
    const getDetails = jest.fn();
    getDetails.mockResolvedValue({
      scopedId: 'pythonNode',
      displayId: 'pythonNode',
      displayName: 'BasicPythonWorkflow.PythonTask',
      displayType: 'Python Task',
      taskTemplate: {
        custom: {},
        container: {},
        metadata: { cacheSerializable: true },
        type: TaskType.ARRAY,
        id: {
          resourceType: 1,
          project: 'flytetest',
          domain: 'development',
          name: 'BasicPythonWorkflow.PythonTask',
          version: 'v0001',
        },
        interface: { inputs: [Object], outputs: [Object] },
      },
    });

    // const mockGetDetails = getDetails as jest.Mock;
    // mockGetDetails.mockResolvedValue(details);

    mockUseContext.mockResolvedValue({
      getNodeExecutionDetails: getDetails,
      workflowId: mockWorkflowId,
      compiledWorkflowClosure: null,
    });

    const { container, queryByText } = render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <NodeExecutionCacheStatus execution={execution} />
        </QueryClientProvider>
      </MemoryRouter>,
    );

    await waitFor(() => container);

    expect(container).toBeEmptyDOMElement();

    // await waitFor(() => queryByText(cacheStatusMessages[CatalogCacheStatus.MAP_CACHE]));

    // expect(queryByText(cacheStatusMessages[CatalogCacheStatus.MAP_CACHE])).toBeInTheDocument();
  });

  it('should render cache hit status text, if execution has cacheStatus CACHE_HIT', async () => {
    const cacheStatus = CatalogCacheStatus.CACHE_HIT;
    const mockExecution = { ...execution, closure: { taskNodeMetadata: { cacheStatus } } };
    const { queryByText } = renderComponent({ execution: mockExecution });
    await waitFor(() => queryByText(cacheStatusMessages[cacheStatus]));

    expect(queryByText(cacheStatusMessages[cacheStatus])).toBeInTheDocument();
  });
});
