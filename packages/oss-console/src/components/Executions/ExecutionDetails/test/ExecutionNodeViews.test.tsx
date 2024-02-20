import * as React from 'react';
import { fireEvent, render, waitFor, screen } from '@testing-library/react';
import {
  QueryClient,
  QueryClientProvider as QueryClientProviderImport,
  QueryClientProviderProps,
} from 'react-query';
import { ThemeProvider } from '@mui/material/styles';
import { muiTheme } from '@clients/theme/Theme/muiTheme';
import { MemoryRouter } from 'react-router';
import { filterLabels } from '../../filters/constants';
import { nodeExecutionStatusFilters } from '../../filters/statusFilters';
import { oneFailedTaskWorkflow } from '../../../../mocks/data/fixtures/oneFailedTaskWorkflow';
import { insertFixture } from '../../../../mocks/data/insertFixture';
import { mockServer } from '../../../../mocks/server';
import { Execution, NodeExecution } from '../../../../models/Execution/types';
import { createTestQueryClient } from '../../../../test/utils';
import { ExecutionContext } from '../../contexts';
import { listNodeExecutions, listTaskExecutions } from '../../../../models/Execution/api';
import { mockWorkflowId } from '../../../../mocks/data/fixtures/types';

import {
  TransformerWorkflowToDag,
  transformerWorkflowToDag,
} from '../../../WorkflowGraph/transformerWorkflowToDag';
import { dNode } from '../../../../models/Graph/types';
import { ExecutionNodeViews } from '../ExecutionNodeViews';
import { tabs } from '../constants';
import { NodeExecutionPhase } from '../../../../models/Execution/enums';
import { NodeExecutionDetailsContext } from '../../contextProvider/NodeExecutionDetails/NodeExecutionDetailsContextProvider';
import { WorkflowNodeExecutionsProvider } from '../../contextProvider/NodeExecutionDetails/WorkflowNodeExecutionsProvider';

const QueryClientProvider: React.FC<React.PropsWithChildren<QueryClientProviderProps>> =
  QueryClientProviderImport;

jest.mock('../../../../components/Executions/Tables/NodeExecutionRow', () => ({
  NodeExecutionRow: jest.fn(({ node }) => (
    <div data-testid="node-execution-row">
      <span id="node-execution-col-id">{node?.execution?.id?.nodeId}</span>
    </div>
  )),
}));

jest.mock(
  '../../../../components/Executions/ExecutionDetails/Timeline/ExecutionTimelineFooter',
  () => ({
    ExecutionTimelineFooter: jest.fn(() => <div></div>),
  }),
);

jest.mock(
  '../../../../components/Executions/ExecutionDetails/Timeline/TimelineChart/index',
  () => ({
    TimelineChart: jest.fn(() => <div></div>),
  }),
);

jest.mock('../../../../components/Executions/ExecutionDetails/Timeline/NodeExecutionName', () => ({
  NodeExecutionName: jest.fn(({ name }) => <div>{name}</div>),
}));
jest.mock('../../../../models/Execution/api', () => ({
  listNodeExecutions: jest.fn(),
  listTaskExecutions: jest.fn(),
}));

jest.mock('../../../../components/WorkflowGraph/transformerWorkflowToDag', () => ({
  transformerWorkflowToDag: jest.fn(),
}));

jest.mock('../../../../queries/workflowQueries', () => ({
  makeNodeExecutionDynamicWorkflowQuery: jest.fn(() => ({
    queryFn: jest.fn(),
  })),
}));

jest.mock('../../../../queries/nodeExecutionQueries', () => ({
  makeNodeExecutionListQuery: jest.fn(() => ({
    queryFn: jest.fn(),
  })),
}));

describe('ExecutionNodeViews', () => {
  let queryClient: QueryClient;
  let execution: Execution;
  let fixture: ReturnType<typeof oneFailedTaskWorkflow.generate>;
  let nodeExecutionsArray: NodeExecution[];
  beforeEach(() => {
    fixture = oneFailedTaskWorkflow.generate();
    execution = fixture.workflowExecutions.top.data;
    insertFixture(mockServer, fixture);
    const { nodeExecutions } = fixture.workflowExecutions.top;
    nodeExecutionsArray = Object.values(nodeExecutions).map(({ data }) => data);

    jest
      .fn(transformerWorkflowToDag)
      .mockImplementation((_workflow, _inputNodeExecutionsById): TransformerWorkflowToDag => {
        const nodes = nodeExecutionsArray.map((n) => ({
          id: n.id.nodeId,
          scopedId: n.scopedId,
          execution: n,
          // type: dTypes.gateNode,
          name: n.id.nodeId,
          type: 3,
          nodes: [],
          edges: [],
        }));
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
              ...(nodes as dNode[]),
            ],
          },
          staticExecutionIdsMap: {},
        } as TransformerWorkflowToDag;
      });
    jest.fn(listNodeExecutions).mockImplementation((_, filters) => {
      let finalNodes = nodeExecutionsArray;
      if (filters?.filter?.length) {
        const phasesvalue = filters?.filter?.filter((f) => f.key === 'phase')?.[0].value;
        const phases = Array.isArray(phasesvalue)
          ? phasesvalue?.map((f) => NodeExecutionPhase[f])
          : phasesvalue;
        finalNodes = finalNodes.filter((n) => {
          return Array.isArray(phases)
            ? phases.includes(n.closure.phase)
            : typeof phases === 'string'
            ? phases.includes(`${n.closure.phase}`)
            : false;
        });
      }
      return Promise.resolve({
        entities: Object.values(finalNodes),
      });
    });
    jest.fn(listTaskExecutions).mockImplementation(() => {
      return Promise.resolve({
        entities: [],
      });
    });
    queryClient = createTestQueryClient();
  });

  const renderViews = () =>
    render(
      <MemoryRouter>
        <ThemeProvider theme={muiTheme}>
          <QueryClientProvider client={queryClient}>
            <ExecutionContext.Provider value={{ execution }}>
              <NodeExecutionDetailsContext.Provider
                value={{
                  compiledWorkflowClosure: {} as any,
                  getNodeExecutionDetails: jest.fn(),
                  workflowId: mockWorkflowId,
                  updateWorkflow: jest.fn(),
                }}
              >
                <WorkflowNodeExecutionsProvider initialNodeExecutions={nodeExecutionsArray as any}>
                  <ExecutionNodeViews />
                </WorkflowNodeExecutionsProvider>
              </NodeExecutionDetailsContext.Provider>
            </ExecutionContext.Provider>
          </QueryClientProvider>
        </ThemeProvider>
      </MemoryRouter>,
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

    // Switch to the Graph tab
    await fireEvent.click(statusButton);
    await fireEvent.click(timelineTab);
    await waitFor(() => queryByText(succeededNodeName));

    // Switch back to Nodes Tab and verify filter still applied
    await fireEvent.click(nodesTab);
    await waitFor(() => queryByText(failedNodeName));
    expect(queryByText(succeededNodeName)).not.toBeInTheDocument();
  });
});
