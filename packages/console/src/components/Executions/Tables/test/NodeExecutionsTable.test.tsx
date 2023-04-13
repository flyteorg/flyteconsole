import { render, waitFor } from '@testing-library/react';
import {
  NodeExecutionDetailsContextProvider,
} from 'components/Executions/contextProvider/NodeExecutionDetails';
import {
  ExecutionContext,
  WorkflowNodeExecutionsContext,
} from 'components/Executions/contexts';
import { basicPythonWorkflow } from 'mocks/data/fixtures/basicPythonWorkflow';
import { noExecutionsFoundString } from 'common/constants';
import { mockWorkflowId } from 'mocks/data/fixtures/types';
import { insertFixture } from 'mocks/data/insertFixture';
import { mockServer } from 'mocks/server';
import { NodeExecutionPhase } from 'models/Execution/enums';
import * as React from 'react';
import { dateToTimestamp } from 'common/utils';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createTestQueryClient } from 'test/utils';
import { dNode } from 'models/Graph/types';
import { useNodeExecutionFiltersState } from 'components/Executions/filters/useExecutionFiltersState';
import { Execution, NodeExecution } from 'models';
import { listNodeExecutions, listTaskExecutions } from 'models/Execution/api';
import { NodeExecutionsTable } from '../NodeExecutionsTable';

jest.mock('components/Workflow/workflowQueries');
const { fetchWorkflow } = require('components/Workflow/workflowQueries');

jest.mock('components/Executions/filters/useExecutionFiltersState');
const mockUseNodeExecutionFiltersState =
  useNodeExecutionFiltersState as jest.Mock<any>;
mockUseNodeExecutionFiltersState.mockReturnValue({
  filters: [],
  appliedFilters: [],
});

jest.mock('components/Executions/Tables/NodeExecutionRow', () => ({
  NodeExecutionRow: jest.fn(({ node }) => (
    <div data-testid="node-execution-row">
      <div data-testid="node-execution-col-id">
        {node?.execution?.id?.nodeId}
      </div>
      <div data-testid="node-execution-col-phase">
        {node?.execution?.closure?.phase}
      </div>
    </div>
  )),
}));

jest.mock('models/Execution/api', () => ({
  listNodeExecutions: jest.fn(),
  listTaskExecutions: jest.fn(),
}));

const mockNodes = (n: number): dNode[] => {
  const nodes: dNode[] = [];
  for (let i = 1; i <= n; i++) {
    nodes.push({
      id: `node${i}`,
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

const mockExecutionsById = (n: number, phases: NodeExecutionPhase[]) => {
  const nodeExecutionsById = {};

  for (let i = 1; i <= n; i++) {
    nodeExecutionsById[`n${i}`] = {
      closure: {
        createdAt: dateToTimestamp(new Date()),
        outputUri: '',
        phase: phases[i - 1],
      },
      id: {
        executionId,
        nodeId: `node${i}`,
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
    fetchWorkflow.mockImplementation(() =>
      Promise.resolve(fixture.workflows.top),
    );

    listNodeExecutions.mockImplementation(() => {
      return Promise.resolve({
        entities: Object.values([]),
      });
    });
    listTaskExecutions.mockImplementation(() => {
      return Promise.resolve({
        entities: Object.values([]),
      });
    });
  });

  const renderTable = ({ nodeExecutionsById, initialNodes }) =>
    render(
      <QueryClientProvider client={queryClient}>
        <ExecutionContext.Provider
          value={{
            execution: {
              id: executionId,
            } as Execution,
          }}
        >
          <NodeExecutionDetailsContextProvider workflowId={mockWorkflowId}>
            <WorkflowNodeExecutionsContext.Provider
              value={{
                dagData: {
                  dagError: null,
                  mergedDag: {},
                },
                initialDNodes: initialNodes,
                nodeExecutionsById,
                setCurrentNodeExecutionsById: () => {},
                setShouldUpdate: () => {},
                shouldUpdate: false,
              }}
            >
              <NodeExecutionsTable />
            </WorkflowNodeExecutionsContext.Provider>
          </NodeExecutionDetailsContextProvider>
        </ExecutionContext.Provider>
      </QueryClientProvider>,
    );

  it('renders empty content when there are no nodes', async () => {
    const { queryByText, queryByTestId } = renderTable({
      initialNodes: [],
      nodeExecutionsById: {},
    });

    await waitFor(() => queryByText(noExecutionsFoundString));

    expect(queryByText(noExecutionsFoundString)).toBeInTheDocument();
    expect(queryByTestId('node-execution-row')).not.toBeInTheDocument();
  });

  it('renders NodeExecutionRows with initialNodes when no filteredNodes were provided', async () => {
    const phases = [NodeExecutionPhase.FAILED, NodeExecutionPhase.SUCCEEDED];
    const nodeExecutionsById = mockExecutionsById(2, phases);

    const { queryAllByTestId } = renderTable({
      initialNodes,
      nodeExecutionsById,
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
    for (const i in initialNodes) {
      expect(ids[i]).toHaveTextContent(initialNodes[i].id);
      expect(renderedPhases[i]).toHaveTextContent(phases[i].toString());
    }
  });

  it('renders NodeExecutionRows with initialNodes even when filterNodes were provided, if appliedFilters is empty', async () => {
    const phases = [NodeExecutionPhase.FAILED, NodeExecutionPhase.SUCCEEDED];
    const nodeExecutionsById = mockExecutionsById(2, phases);
    const filteredNodeExecutions = nodeExecutionsById['n1'];
    listNodeExecutions.mockImplementation(() => {
      return Promise.resolve({
        entities: filteredNodeExecutions,
      });
    });

    const { queryAllByTestId } = renderTable({
      initialNodes,
      nodeExecutionsById,
    });

    await waitFor(() =>
      expect(listNodeExecutions).toHaveBeenCalledWith(
        expect.objectContaining(executionId),
        expect.objectContaining({
          filter: [],
        }),
      ),
    );
    await waitFor(() => queryAllByTestId('node-execution-row'));

    expect(queryAllByTestId('node-execution-row')).toHaveLength(
      initialNodes.length,
    );
    const ids = queryAllByTestId('node-execution-col-id');
    expect(ids).toHaveLength(initialNodes.length);
    const renderedPhases = queryAllByTestId('node-execution-col-phase');
    expect(renderedPhases).toHaveLength(initialNodes.length);
    for (const i in initialNodes) {
      expect(ids[i]).toHaveTextContent(initialNodes[i].id);
      expect(renderedPhases[i]).toHaveTextContent(phases[i].toString());
    }
  });

  it('renders NodeExecutionRows with filterNodes if appliedFilters are less than original filters', async () => {
    const appliedFilters = [
      { key: 'phase', operation: 'value_in', value: ['FAILED'] },
    ];
    mockUseNodeExecutionFiltersState.mockReturnValue({
      filters: [],
      appliedFilters,
    });

    const phases = [NodeExecutionPhase.FAILED, NodeExecutionPhase.SUCCEEDED];
    const nodeExecutionsById = mockExecutionsById(2, phases);
    const filteredNodeExecutions = [nodeExecutionsById['n1']];
    listNodeExecutions.mockImplementation(() => {
      return Promise.resolve({
        entities: filteredNodeExecutions,
      });
    });

    const { queryAllByTestId, debug, container } = renderTable({
      initialNodes,
      nodeExecutionsById,
    });

    await waitFor(() =>
      expect(listNodeExecutions).toHaveBeenCalledWith(
        expect.objectContaining(executionId),
        expect.objectContaining({
          filter: appliedFilters,
        }),
      ),
    );

    await waitFor(() => {
      const rows = queryAllByTestId('node-execution-row');
      return rows.length === filteredNodeExecutions.length;
    });

    expect(queryAllByTestId('node-execution-row')).toHaveLength(
      filteredNodeExecutions.length,
    );

    const ids = queryAllByTestId('node-execution-col-id');
    expect(ids).toHaveLength(filteredNodeExecutions.length);
    const renderedPhases = queryAllByTestId('node-execution-col-phase');
    expect(renderedPhases).toHaveLength(filteredNodeExecutions.length);
    debug(container)

    for (const i in filteredNodeExecutions) {
      expect(ids[i]).toHaveTextContent(filteredNodeExecutions[i].id?.nodeId);
      expect(renderedPhases[i]).toHaveTextContent(phases[i].toString());
    }
  });

  it('renders NodeExecutionRows with filterNodes if appliedFilters are the same as original filters', async () => {
    const phases = [NodeExecutionPhase.FAILED, NodeExecutionPhase.SUCCEEDED];
    const appliedFilters = [
      { key: 'phase', operation: 'value_in', value: ['FAILED', 'SUCCEEDED'] },
    ];
    mockUseNodeExecutionFiltersState.mockReturnValue({
      filters: [],
      appliedFilters,
    });

    const nodeExecutionsById = mockExecutionsById(2, phases);
    const filteredNodeExecutions: NodeExecution[] = Object.values(nodeExecutionsById);
    listNodeExecutions.mockImplementation(() => {
      return Promise.resolve({
        entities: filteredNodeExecutions,
      });
    });

    const { queryAllByTestId } = renderTable({
      initialNodes,
      nodeExecutionsById,
    });

    await waitFor(() =>
      expect(listNodeExecutions).toHaveBeenCalledWith(
        expect.objectContaining(executionId),
        expect.objectContaining({
          filter: appliedFilters,
        }),
      ),
    );

    await waitFor(() => {
      const rows = queryAllByTestId('node-execution-row');
      return rows.length === filteredNodeExecutions.length;
    });

    expect(queryAllByTestId('node-execution-row')).toHaveLength(
      filteredNodeExecutions.length,
    );

    const ids = queryAllByTestId('node-execution-col-id');
    expect(ids).toHaveLength(filteredNodeExecutions.length);
    const renderedPhases = queryAllByTestId('node-execution-col-phase');
    expect(renderedPhases).toHaveLength(filteredNodeExecutions.length);

    for (const i in filteredNodeExecutions) {
      expect(ids[i]).toHaveTextContent(filteredNodeExecutions[i].id?.nodeId);
      expect(renderedPhases[i]).toHaveTextContent(phases[i].toString());
    }
  });
});
