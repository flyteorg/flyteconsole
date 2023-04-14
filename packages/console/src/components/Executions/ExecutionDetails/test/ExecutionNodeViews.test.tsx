import * as React from 'react';
import { fireEvent, render, waitFor, screen } from '@testing-library/react';
import { filterLabels } from 'components/Executions/filters/constants';
import { nodeExecutionStatusFilters } from 'components/Executions/filters/statusFilters';
import { oneFailedTaskWorkflow } from 'mocks/data/fixtures/oneFailedTaskWorkflow';
import { insertFixture } from 'mocks/data/insertFixture';
import { mockServer } from 'mocks/server';
import { Execution } from 'models/Execution/types';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createTestQueryClient } from 'test/utils';
import { ExecutionContext } from 'components/Executions/contexts';
import { listNodeExecutions, listTaskExecutions } from 'models/Execution/api';
import { NodeExecutionPhase } from 'models';
import { mockWorkflowId } from 'mocks/data/fixtures/types';
import { NodeExecutionDetailsContext } from 'components/Executions/contextProvider/NodeExecutionDetails';
import { transformerWorkflowToDag } from 'components/WorkflowGraph/transformerWorkflowToDag';
import { ExecutionNodeViews } from '../ExecutionNodeViews';
import { tabs } from '../constants';

jest.mock('components/Executions/Tables/NodeExecutionRow', () => ({
  NodeExecutionRow: jest.fn(({ node }) => (
    <div data-testid="node-execution-row">
      <span id="node-execution-col-id">{node?.execution?.id?.nodeId}</span>
    </div>
  )),
}));

jest.mock(
  'components/Executions/ExecutionDetails/Timeline/ExecutionTimelineFooter',
  () => ({
    ExecutionTimelineFooter: jest.fn(() => <div></div>),
  }),
);

jest.mock(
  'components/Executions/ExecutionDetails/Timeline/TimelineChart/index',
  () => ({
    TimelineChart: jest.fn(() => <div></div>),
  }),
);

jest.mock(
  'components/Executions/ExecutionDetails/Timeline/NodeExecutionName',
  () => ({
    NodeExecutionName: jest.fn(({ name }) => <div>{name}</div>),
  }),
);
jest.mock('models/Execution/api', () => ({
  listNodeExecutions: jest.fn(),
  listTaskExecutions: jest.fn(),
}));

jest.mock('components/WorkflowGraph/transformerWorkflowToDag', () => ({
  transformerWorkflowToDag: jest.fn(),
}));

// ExecutionNodeViews uses query params for NE list, so we must match them
// for the list to be returned properly
const baseQueryParams = {
  filters: '',
  'sort_by.direction': 'ASCENDING',
  'sort_by.key': 'created_at',
};

describe('ExecutionNodeViews', () => {
  let queryClient: QueryClient;
  let execution: Execution;
  let fixture: ReturnType<typeof oneFailedTaskWorkflow.generate>;
  beforeEach(() => {
    fixture = oneFailedTaskWorkflow.generate();
    execution = fixture.workflowExecutions.top.data;
    insertFixture(mockServer, fixture);
    const nodeExecutions = fixture.workflowExecutions.top.nodeExecutions;
    const nodeExecutionsArray = Object.values(nodeExecutions).map(
      ({ data }) => data,
    );
    transformerWorkflowToDag.mockImplementation(_ => {
      return {
        dag: {
          id: 'start-node',
          scopedId: 'start-node',
          value: {
            id: 'start-node',
          },
          type: 4,
          name: 'start',
          nodes: [
            {
              id: 'start-node',
              scopedId: 'start-node',
              value: {
                inputs: [],
                upstreamNodeIds: [],
                outputAliases: [],
                id: 'start-node',
              },
              type: 4,
              name: 'start',
              nodes: [],
              edges: [],
            },
            {
              id: 'end-node',
              scopedId: 'end-node',
              value: {
                inputs: [],
                upstreamNodeIds: [],
                outputAliases: [],
                id: 'end-node',
              },
              type: 5,
              name: 'end',
              nodes: [],
              edges: [],
            },
            ...nodeExecutionsArray.map(n => ({
              id: n.id.nodeId,
              scopedId: n.scopedId,
              execution: n,
              // type: dTypes.gateNode,
              name: n.id.nodeId,
              type: 3,
              nodes: [],
              edges: [],
            })),
          ],
        },
        staticExecutionIdsMap: {},
      };
    });
    listNodeExecutions.mockImplementation((_, filters) => {
      let finalNodes = nodeExecutionsArray;
      if (filters?.filter?.length) {
        const phases = filters?.filter
          ?.filter(f => f.key === 'phase')?.[0]
          .value?.map(f => NodeExecutionPhase[f]);
        finalNodes = finalNodes.filter(n => {
          return phases.includes(n.closure.phase);
        });
      }
      return Promise.resolve({
        entities: Object.values(finalNodes),
      });
    });
    listTaskExecutions.mockImplementation(() => {
      return Promise.resolve({
        entities: [],
      });
    });
    queryClient = createTestQueryClient();
  });

  const renderViews = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <ExecutionContext.Provider value={{ execution }}>
          <NodeExecutionDetailsContext.Provider
            value={{
              compiledWorkflowClosure: {} as any,
              getNodeExecutionDetails: jest.fn.call,
              workflowId: mockWorkflowId,
            }}
          >
            <ExecutionNodeViews />
          </NodeExecutionDetailsContext.Provider>
        </ExecutionContext.Provider>
      </QueryClientProvider>,
    );

  it('maintains filter when switching back to nodes tab', async () => {
    const { nodeExecutions } = fixture.workflowExecutions.top;
    const failedNodeName = nodeExecutions.failedNode.data.id.nodeId;
    const succeededNodeName = nodeExecutions.pythonNode.data.id.nodeId;

    const { getByText, queryByText, queryAllByTestId } = renderViews();

    await waitFor(() => getByText(tabs.nodes.label));

    const nodesTab = getByText(tabs.nodes.label);
    const timelineTab = getByText(tabs.timeline.label);

    // Ensure we are on Nodes tab
    await fireEvent.click(nodesTab);
    await waitFor(() => {
      const nodes = queryAllByTestId('node-execution-row');
      return nodes?.length === 2;
    });

    await waitFor(() => queryByText(succeededNodeName));

    const statusButton = await waitFor(() => getByText(filterLabels.status));

    // Apply 'Failed' filter and wait for list to include only the failed item
    await fireEvent.click(statusButton);

    const failedFilter = await waitFor(() =>
      screen.getByLabelText(nodeExecutionStatusFilters.failed.label),
    );

    // Wait for succeeded task to disappear and ensure failed task remains
    await fireEvent.click(failedFilter);
    await waitFor(() => {
      const nodes = queryAllByTestId('node-execution-row');
      return nodes?.length === 1;
    });

    expect(queryByText(succeededNodeName)).not.toBeInTheDocument();

    expect(queryByText(failedNodeName)).toBeInTheDocument();

    // Switch to the Graph tab
    await fireEvent.click(statusButton);
    await fireEvent.click(timelineTab);
    await waitFor(() => queryByText(succeededNodeName));

    // expect all initital nodes to be rendered
    expect(queryByText(succeededNodeName)).toBeInTheDocument();
    expect(queryByText(failedNodeName)).toBeInTheDocument();

    // Switch back to Nodes Tab and verify filter still applied
    await fireEvent.click(nodesTab);
    await waitFor(() => queryByText(failedNodeName));
    expect(queryByText(succeededNodeName)).not.toBeInTheDocument();
    expect(queryByText(failedNodeName)).toBeInTheDocument();
  });
});
