import { render, waitFor } from '@testing-library/react';
import { NodeExecutionDetailsContextProvider } from 'components/Executions/contextProvider/NodeExecutionDetails';
import {
  NodeExecutionsByIdContext,
  NodeExecutionsRequestConfigContext,
} from 'components/Executions/contexts';
import { basicPythonWorkflow } from 'mocks/data/fixtures/basicPythonWorkflow';
import { noExecutionsFoundString } from 'common/constants';
import { mockWorkflowId } from 'mocks/data/fixtures/types';
import { insertFixture } from 'mocks/data/insertFixture';
import { mockServer } from 'mocks/server';
import { RequestConfig } from 'models/AdminEntity/types';
import { NodeExecutionPhase } from 'models/Execution/enums';
import * as React from 'react';
import { dateToTimestamp } from 'common/utils';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createTestQueryClient } from 'test/utils';
import { NodeExecutionsTable } from '../NodeExecutionsTable';

jest.mock('components/Workflow/workflowQueries');
const { fetchWorkflow } = require('components/Workflow/workflowQueries');

jest.mock('components/common/DetailsPanel', () => ({
  DetailsPanel: jest.fn(({ children }) => <div data-testid="details-panel">{children}</div>),
}));

jest.mock('components/Executions/Tables/NodeExecutionRow', () => ({
  NodeExecutionRow: jest.fn(({ children, execution }) => {
    return (
      <div data-testid="node-execution-row">
        <span id={`node-execution-col-id-${execution?.id?.nodeId}`} />
        <span id="node-execution-col-phase">{execution?.closure?.phase}</span>
        {children}
      </div>
    );
  }),
}));

describe('NodeExecutionsTable', () => {
  let queryClient: QueryClient;
  let requestConfig: RequestConfig;
  const node1 = {
    id: 'node1',
    scopedId: 'n1',
    type: 4,
    name: 'Node 1',
    nodes: [],
    edges: [],
  };
  const node2 = {
    id: 'node2',
    scopedId: 'n2',
    type: 4,
    name: 'Node 2',
    nodes: [],
    edges: [],
  };
  const initialNodes = [node1, node2];

  beforeEach(() => {
    requestConfig = {};
    queryClient = createTestQueryClient();
  });

  const renderTable = ({
    nodeExecutionsById,
    initialNodes,
    selectedExecution,
    setSelectedExecution,
  }) =>
    render(
      <QueryClientProvider client={queryClient}>
        <NodeExecutionsRequestConfigContext.Provider value={requestConfig}>
          <NodeExecutionDetailsContextProvider workflowId={mockWorkflowId}>
            <NodeExecutionsByIdContext.Provider value={nodeExecutionsById}>
              <NodeExecutionsTable
                initialNodes={initialNodes}
                selectedExecution={selectedExecution}
                setSelectedExecution={setSelectedExecution}
              />
            </NodeExecutionsByIdContext.Provider>
          </NodeExecutionDetailsContextProvider>
        </NodeExecutionsRequestConfigContext.Provider>
      </QueryClientProvider>,
    );

  describe('when rendering the DetailsPanel', () => {
    let fixture: ReturnType<typeof basicPythonWorkflow.generate>;

    beforeEach(() => {
      fixture = basicPythonWorkflow.generate();
      insertFixture(mockServer, fixture);
      fetchWorkflow.mockImplementation(() => Promise.resolve(fixture.workflows.top));
    });

    it('renders empty content when there are no nodes', async () => {
      const selectedExecution = null;
      const setSelectedExecution = jest.fn();

      const { container, queryByText } = renderTable({
        initialNodes: [],
        selectedExecution,
        setSelectedExecution,
        nodeExecutionsById: {},
      });

      await waitFor(() => container);
      expect(queryByText(noExecutionsFoundString)).toBeTruthy();
    });

    it('renders NodeExecutionRows with proper nodeExecutions', async () => {
      const selectedExecution = null;
      const setSelectedExecution = jest.fn();
      const phases = [3, 4];
      const nodeExecutionsById = {
        n1: {
          closure: {
            createdAt: dateToTimestamp(new Date()),
            outputUri: '',
            phase: phases[0],
          },
          id: {
            executionId: { domain: 'domain', name: 'name', project: 'project' },
            nodeId: 'node1',
          },
          inputUri: '',
          scopedId: 'n1',
        },
        n2: {
          closure: {
            createdAt: dateToTimestamp(new Date()),
            outputUri: '',
            phase: phases[1],
          },
          id: {
            executionId: { domain: 'domain', name: 'name', project: 'project' },
            nodeId: 'node2',
          },
          inputUri: '',
          scopedId: 'n2',
        },
      };

      const { container, getAllByTestId } = renderTable({
        initialNodes,
        selectedExecution,
        setSelectedExecution,
        nodeExecutionsById,
      });

      await waitFor(() => container);
      const rows = getAllByTestId('node-execution-row');
      for (const i in initialNodes) {
        expect(rows[i].querySelector(`#node-execution-col-id-${initialNodes[i].id}`)).toBeValid();
        expect(rows[i].querySelector('#node-execution-col-phase')?.innerHTML).toBe(
          phases[i].toString(),
        );
      }
    });

    it('renders future nodes with UNDEFINED phase', async () => {
      const selectedExecution = null;
      const setSelectedExecution = jest.fn();
      const phases = [3, NodeExecutionPhase.UNDEFINED];
      const nodeExecutionsById = {
        n1: {
          closure: {
            createdAt: dateToTimestamp(new Date()),
            outputUri: '',
            phase: phases[0],
          },
          id: {
            executionId: { domain: 'domain', name: 'name', project: 'project' },
            nodeId: 'node1',
          },
          inputUri: '',
          scopedId: 'n1',
        },
      };

      const { container, getAllByTestId } = renderTable({
        initialNodes,
        selectedExecution,
        setSelectedExecution,
        nodeExecutionsById,
      });

      await waitFor(() => container);
      const rows = getAllByTestId('node-execution-row');
      for (const i in initialNodes) {
        expect(rows[i].querySelector(`#node-execution-col-id-${initialNodes[i].id}`)).toBeValid();
        expect(rows[i].querySelector('#node-execution-col-phase')?.innerHTML).toBe(
          phases[i].toString(),
        );
      }
    });
  });
});
