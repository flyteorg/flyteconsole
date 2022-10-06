import { render } from '@testing-library/react';
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
import { NodeExecution } from 'models/Execution/types';
import { dNode } from 'models/Graph/types';
import { NodeExecutionsTable } from '../NodeExecutionsTable';

jest.mock('components/Workflow/workflowQueries');
const { fetchWorkflow } = require('components/Workflow/workflowQueries');

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

const mockNodeExecutions = (n: number, phases: NodeExecutionPhase[]): NodeExecution[] => {
  const nodeExecutions: NodeExecution[] = [];
  for (let i = 1; i <= n; i++) {
    nodeExecutions.push({
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
    });
  }
  return nodeExecutions;
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

describe('NodeExecutionsTableExecutions > Tables > NodeExecutionsTable', () => {
  let queryClient: QueryClient;
  let requestConfig: RequestConfig;
  const initialNodes = mockNodes(2);
  const selectedExecution = null;
  const setSelectedExecution = jest.fn();

  beforeEach(() => {
    requestConfig = {};
    queryClient = createTestQueryClient();
  });

  const renderTable = ({
    nodeExecutionsById,
    initialNodes,
    filteredNodeExecutions,
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
                filteredNodeExecutions={filteredNodeExecutions}
              />
            </NodeExecutionsByIdContext.Provider>
          </NodeExecutionDetailsContextProvider>
        </NodeExecutionsRequestConfigContext.Provider>
      </QueryClientProvider>,
    );

  describe('when rendering the table', () => {
    let fixture: ReturnType<typeof basicPythonWorkflow.generate>;

    beforeEach(() => {
      fixture = basicPythonWorkflow.generate();
      insertFixture(mockServer, fixture);
      fetchWorkflow.mockImplementation(() => Promise.resolve(fixture.workflows.top));
    });

    it('renders empty content when there are no nodes', async () => {
      const { getByText } = renderTable({
        initialNodes: [],
        selectedExecution,
        setSelectedExecution,
        nodeExecutionsById: {},
        filteredNodeExecutions: [],
      });

      expect(getByText(noExecutionsFoundString)).toBeInTheDocument();
    });

    it('renders NodeExecutionRows with proper nodeExecutions', async () => {
      const phases = [NodeExecutionPhase.FAILED, NodeExecutionPhase.SUCCEEDED];
      const nodeExecutionsById = mockExecutionsById(2, phases);
      const filteredNodeExecutions = mockNodeExecutions(2, phases);

      const { getByText } = renderTable({
        initialNodes,
        selectedExecution,
        setSelectedExecution,
        nodeExecutionsById,
        filteredNodeExecutions,
      });

      for (const i in initialNodes) {
        expect(getByText(`node-execution-${initialNodes[i].id}-${phases[i]}`)).toBeInTheDocument();
      }
    });

    it('renders future nodes with UNDEFINED phase', async () => {
      const phases = [NodeExecutionPhase.SUCCEEDED, NodeExecutionPhase.UNDEFINED];
      const nodeExecutionsById = mockExecutionsById(1, phases);
      const filteredNodeExecutions = mockNodeExecutions(1, phases);

      const { getByText } = renderTable({
        initialNodes,
        selectedExecution,
        setSelectedExecution,
        nodeExecutionsById,
        filteredNodeExecutions,
      });

      for (const i in initialNodes) {
        expect(getByText(`node-execution-${initialNodes[i].id}-${phases[i]}`)).toBeInTheDocument();
      }
    });
  });
});
