import { render, waitFor } from '@testing-library/react';
import * as React from 'react';
import {
  QueryClient,
  QueryClientProvider as QueryClientProviderImport,
  QueryClientProviderProps,
} from 'react-query';
import { noExecutionsFoundString } from '@clients/common/constants';
import { ExecutionContext, WorkflowNodeExecutionsContext } from '../../contexts';
import { basicPythonWorkflow } from '../../../../mocks/data/fixtures/basicPythonWorkflow';
import { insertFixture } from '../../../../mocks/data/insertFixture';
import { mockServer } from '../../../../mocks/server';
import { NodeExecutionPhase } from '../../../../models/Execution/enums';
import { dateToTimestamp } from '../../../../common/utils';
import { createTestQueryClient } from '../../../../test/utils';
import * as executionsApi from '../../../../models/Execution/api';
import { dNode } from '../../../../models/Graph/types';
import { useNodeExecutionFiltersState } from '../../filters/useExecutionFiltersState';
import { createWorkflowObject } from '../../../../models/__mocks__/workflowData';
import { NodeExecutionsTable } from '../NodeExecutionsTable';
import { NodeExecution, Execution } from '../../../../models/Execution/types';
import { NodeExecutionDetailsContextProvider } from '../../contextProvider/NodeExecutionDetails/NodeExecutionDetailsContextProvider';
import { useNodeExecutionsById } from '../../contextProvider/NodeExecutionDetails/WorkflowNodeExecutionsProvider';

const workflow = createWorkflowObject();

const QueryClientProvider: React.FC<React.PropsWithChildren<QueryClientProviderProps>> =
  QueryClientProviderImport;

jest.mock('../../../../queries/workflowQueries');
const { fetchWorkflow } = require('../../../../queries/workflowQueries');

jest.mock('../../../../components/Executions/filters/useExecutionFiltersState');
const mockUseNodeExecutionFiltersState = useNodeExecutionFiltersState as jest.Mock<any>;
mockUseNodeExecutionFiltersState.mockReturnValue({
  filters: [],
  appliedFilters: [],
});

jest.mock('../../../../components/Executions/Tables/NodeExecutionRow', () => ({
  NodeExecutionRow: jest.fn(({ node }) => {
    const { nodeExecutionsById } = useNodeExecutionsById();
    const execution = nodeExecutionsById[node.scopedId];
    return (
      <div data-testid="node-execution-row">
        <div data-testid="node-execution-col-id">{execution?.id?.nodeId}</div>
        <div data-testid="node-execution-col-phase">{execution?.closure?.phase}</div>
      </div>
    );
  }),
}));

jest.mock('../../../../models/Execution/api', () => ({
  listNodeExecutions: jest.fn(),
  listTaskExecutions: jest.fn(),
}));

const mockNodes = (n: number): dNode[] => {
  const nodes: dNode[] = [];
  for (let i = 1; i <= n; i++) {
    nodes.push({
      id: `n${i}`,
      scopedId: `n${i}`,
      type: 4,
      name: `Node ${i}`,
      nodes: [],
      edges: [],
    });
  }
  return nodes;
};
const executionId = { domain: 'domain', name: 'name', project: 'project' };

const mockExecutionsById = (
  n: number,
  phases: NodeExecutionPhase[],
): Record<string, NodeExecution> => {
  const nodeExecutionsById: Record<string, NodeExecution> = {};

  for (let i = 1; i <= n; i++) {
    nodeExecutionsById[`n${i}`] = {
      closure: {
        createdAt: dateToTimestamp(new Date()),
        outputUri: '',
        phase: phases[i - 1] as NodeExecution['closure']['phase'],
      },
      id: {
        executionId,
        nodeId: `n${i}`,
      },
      inputUri: '',
      scopedId: `n${i}`,
    };
  }
  return nodeExecutionsById;
};

describe('NodeExecutionsTableExecutions > Tables > NodeExecutionsTable', () => {
  let queryClient: QueryClient;
  let fixture: ReturnType<typeof basicPythonWorkflow.generate>;
  const initialNodes = mockNodes(2);

  beforeEach(() => {
    queryClient = createTestQueryClient();
    fixture = basicPythonWorkflow.generate();
    insertFixture(mockServer, fixture);
    fetchWorkflow.mockImplementation(() => Promise.resolve(fixture.workflows.top));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderTable = ({ nodeExecutionsById, initialNodes, filterState }) =>
    render(
      <QueryClientProvider client={queryClient}>
        <ExecutionContext.Provider
          value={{
            execution: {
              id: executionId,
            } as Execution,
          }}
        >
          <NodeExecutionDetailsContextProvider initialWorkflow={workflow}>
            <WorkflowNodeExecutionsContext.Provider
              value={{
                dagData: {
                  dagError: null,
                  mergedDag: {} as any,
                },
                visibleNodes: initialNodes,
                nodeExecutionsById,
                setCurrentNodeExecutionsById: () => {},
                toggleNode: () => {},
              }}
            >
              <NodeExecutionsTable filterState={filterState} />
            </WorkflowNodeExecutionsContext.Provider>
          </NodeExecutionDetailsContextProvider>
        </ExecutionContext.Provider>
      </QueryClientProvider>,
    );

  it('renders empty content when there are no nodes', async () => {
    const filterState = {
      filters: [],
      appliedFilters: [],
    };
    const mocklistTaskExecutions = jest.spyOn(executionsApi, 'listTaskExecutions');
    const mocklistNodeExecutions = jest.spyOn(executionsApi, 'listNodeExecutions');
    mocklistNodeExecutions.mockResolvedValue({ entities: [] });
    mocklistTaskExecutions.mockResolvedValue({ entities: [] });

    const { queryByText, queryByTestId } = renderTable({
      initialNodes: [],
      nodeExecutionsById: {},
      filterState,
    });

    await waitFor(() => queryByText(noExecutionsFoundString));

    expect(queryByText(noExecutionsFoundString)).toBeInTheDocument();
    expect(queryByTestId('node-execution-row')).not.toBeInTheDocument();
  });

  it('renders NodeExecutionRows with initialNodes when no filteredNodes were provided', async () => {
    const phases = [NodeExecutionPhase.FAILED, NodeExecutionPhase.SUCCEEDED];
    const nodeExecutionsById = mockExecutionsById(2, phases);
    const mocklistTaskExecutions = jest.spyOn(executionsApi, 'listTaskExecutions');
    const mocklistNodeExecutions = jest.spyOn(executionsApi, 'listNodeExecutions');
    mocklistNodeExecutions.mockResolvedValue({ entities: [] });
    mocklistTaskExecutions.mockResolvedValue({ entities: [] });

    const filterState = {
      filters: [],
      appliedFilters: [],
    };
    const { queryAllByTestId } = renderTable({
      initialNodes,
      nodeExecutionsById,
      filterState,
    });

    await waitFor(() => {
      const nodes = queryAllByTestId('node-execution-row');
      expect(nodes).toHaveLength(initialNodes.length);
      return nodes;
    });

    const ids = queryAllByTestId('node-execution-col-id');
    expect(ids).toHaveLength(initialNodes.length);
    const renderedPhases = queryAllByTestId('node-execution-col-phase');
    expect(renderedPhases).toHaveLength(initialNodes.length);
    for (let i = 0; i < initialNodes.length; i++) {
      expect(ids[i]).toHaveTextContent(initialNodes[i].id);
      expect(renderedPhases[i]).toHaveTextContent(phases[i].toString());
    }
  });

  it('renders NodeExecutionRows with initialNodes even when filterNodes were provided, if appliedFilters is empty', async () => {
    const phases = [NodeExecutionPhase.FAILED, NodeExecutionPhase.SUCCEEDED];
    const nodeExecutionsById = mockExecutionsById(2, phases);
    const filteredNodeExecutions = nodeExecutionsById.n1;
    const filterState = {
      filters: [],
      appliedFilters: [],
    };
    const mocklistTaskExecutions = jest.spyOn(executionsApi, 'listTaskExecutions');
    const mocklistNodeExecutions = jest.spyOn(executionsApi, 'listNodeExecutions');
    mocklistNodeExecutions.mockResolvedValue({ entities: [filteredNodeExecutions] });
    mocklistTaskExecutions.mockResolvedValue({ entities: [] });

    const { queryAllByTestId } = renderTable({
      initialNodes,
      nodeExecutionsById,
      filterState,
    });

    await waitFor(() =>
      expect(mocklistNodeExecutions).toHaveBeenCalledWith(
        expect.objectContaining(executionId),
        expect.objectContaining({
          filter: [],
        }),
      ),
    );
    await waitFor(() => queryAllByTestId('node-execution-row'));

    expect(queryAllByTestId('node-execution-row')).toHaveLength(initialNodes.length);
    const ids = queryAllByTestId('node-execution-col-id');
    expect(ids).toHaveLength(initialNodes.length);
    const renderedPhases = queryAllByTestId('node-execution-col-phase');
    expect(renderedPhases).toHaveLength(initialNodes.length);
    for (let i = 0; i < initialNodes.length; i++) {
      expect(ids[i]).toHaveTextContent(initialNodes[i].id);
      expect(renderedPhases[i]).toHaveTextContent(phases[i].toString());
    }
  });

  it('renders NodeExecutionRows with filterNodes if appliedFilters are less than original filters', async () => {
    const appliedFilters = [{ key: 'duration', operation: 'lt', value: 3600 }];
    const filterState = {
      filters: [],
      appliedFilters,
    };
    const phases = [NodeExecutionPhase.FAILED, NodeExecutionPhase.SUCCEEDED];
    const nodeExecutionsById = mockExecutionsById(2, phases);
    const filteredNodeExecutions = [nodeExecutionsById.n1];
    const mocklistTaskExecutions = jest.spyOn(executionsApi, 'listTaskExecutions');
    const mocklistNodeExecutions = jest.spyOn(executionsApi, 'listNodeExecutions');
    mocklistNodeExecutions.mockResolvedValue({ entities: filteredNodeExecutions });
    mocklistTaskExecutions.mockResolvedValue({ entities: [] });

    const { queryAllByTestId } = renderTable({
      initialNodes,
      nodeExecutionsById,
      filterState,
    });

    await waitFor(() =>
      expect(mocklistNodeExecutions).toHaveBeenCalledWith(
        expect.objectContaining(executionId),
        expect.objectContaining({
          filter: appliedFilters,
        }),
      ),
    );

    await waitFor(() => {
      const rows = queryAllByTestId('node-execution-row');
      expect(rows).toHaveLength(filteredNodeExecutions.length);
    });

    const ids = queryAllByTestId('node-execution-col-id');
    expect(ids).toHaveLength(filteredNodeExecutions.length);
    const renderedPhases = queryAllByTestId('node-execution-col-phase');
    expect(renderedPhases).toHaveLength(filteredNodeExecutions.length);

    for (let i = 0; i < filteredNodeExecutions.length; i++) {
      expect(ids[i]).toHaveTextContent(filteredNodeExecutions[i].id?.nodeId);
      expect(renderedPhases[i]).toHaveTextContent(phases[i].toString());
    }
  });

  it('renders NodeExecutionRows with filterNodes if appliedFilters are the same as original filters', async () => {
    const phases = [NodeExecutionPhase.FAILED, NodeExecutionPhase.SUCCEEDED];
    const appliedFilters = [{ key: 'duration', operation: 'lt', value: 3600 }];
    const filterState = {
      filters: [],
      appliedFilters,
    };

    const nodeExecutionsById = mockExecutionsById(2, phases);
    const filteredNodeExecutions: NodeExecution[] = Object.values(nodeExecutionsById);
    const mocklistTaskExecutions = jest.spyOn(executionsApi, 'listTaskExecutions');
    const mocklistNodeExecutions = jest.spyOn(executionsApi, 'listNodeExecutions');
    mocklistNodeExecutions.mockResolvedValue({ entities: filteredNodeExecutions });
    mocklistTaskExecutions.mockResolvedValue({ entities: [] });

    const { queryAllByTestId } = renderTable({
      initialNodes,
      nodeExecutionsById,
      filterState,
    });

    await waitFor(() =>
      expect(mocklistNodeExecutions).toHaveBeenCalledWith(
        expect.objectContaining(executionId),
        expect.objectContaining({
          filter: appliedFilters,
        }),
      ),
    );

    await waitFor(() => {
      const rows = queryAllByTestId('node-execution-row');
      expect(rows).toHaveLength(filteredNodeExecutions.length);
    });

    const ids = queryAllByTestId('node-execution-col-id');
    expect(ids).toHaveLength(filteredNodeExecutions.length);
    const renderedPhases = queryAllByTestId('node-execution-col-phase');
    expect(renderedPhases).toHaveLength(filteredNodeExecutions.length);

    for (let i = 0; i < filteredNodeExecutions.length; i++) {
      expect(ids[i]).toHaveTextContent(filteredNodeExecutions[i].id?.nodeId);
      expect(renderedPhases[i]).toHaveTextContent(phases[i].toString());
    }
  });
});
