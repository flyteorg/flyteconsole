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
import { dNode } from 'models/Graph/types';
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
        <span>
          node-execution-{execution?.id?.nodeId}-{execution?.closure?.phase}
        </span>
        {children}
      </div>
    );
  }),
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
        executionId: { domain: 'domain', name: 'name', project: 'project' },
        nodeId: `node${i}`,
      },
      inputUri: '',
      scopedId: `n${i}`,
    };
  }
  return nodeExecutionsById;
};

describe('NodeExecutionsTable', () => {
  let queryClient: QueryClient;
  let requestConfig: RequestConfig;
  const initialNodes = mockNodes(2);

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

      const { container, getByText } = renderTable({
        initialNodes: [],
        selectedExecution,
        setSelectedExecution,
        nodeExecutionsById: {},
      });

      await waitFor(() => container);
      expect(getByText(noExecutionsFoundString)).toBeInTheDocument();
    });

    it('renders NodeExecutionRows with proper nodeExecutions', async () => {
      const selectedExecution = null;
      const setSelectedExecution = jest.fn();
      const phases = [NodeExecutionPhase.FAILED, NodeExecutionPhase.SUCCEEDED];
      const nodeExecutionsById = mockExecutionsById(2, phases);

      const { container, getByText } = renderTable({
        initialNodes,
        selectedExecution,
        setSelectedExecution,
        nodeExecutionsById,
      });

      await waitFor(() => container);
      for (const i in initialNodes) {
        expect(getByText(`node-execution-${initialNodes[i].id}-${phases[i]}`)).toBeInTheDocument();
      }
    });

    it('renders future nodes with UNDEFINED phase', async () => {
      const selectedExecution = null;
      const setSelectedExecution = jest.fn();
      const phases = [NodeExecutionPhase.SUCCEEDED, NodeExecutionPhase.UNDEFINED];
      const nodeExecutionsById = mockExecutionsById(1, phases);

      const { container, getByText } = renderTable({
        initialNodes,
        selectedExecution,
        setSelectedExecution,
        nodeExecutionsById,
      });

      await waitFor(() => container);
      for (const i in initialNodes) {
        expect(getByText(`node-execution-${initialNodes[i].id}-${phases[i]}`)).toBeInTheDocument();
      }
    });
  });
});
