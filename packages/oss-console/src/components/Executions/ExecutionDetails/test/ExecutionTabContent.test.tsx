import { render, waitFor } from '@testing-library/react';
import * as React from 'react';
import {
  QueryClient,
  QueryClientProvider as QueryClientProviderImport,
  QueryClientProviderProps,
} from 'react-query';
import { MemoryRouter } from 'react-router';
import { WorkflowNodeExecutionsContext } from '../../contexts';
import { basicPythonWorkflow } from '../../../../mocks/data/fixtures/basicPythonWorkflow';
import { insertFixture } from '../../../../mocks/data/insertFixture';
import { mockServer } from '../../../../mocks/server';
import { createTestQueryClient } from '../../../../test/utils';
import { createWorkflowObject } from '../../../../models/__mocks__/workflowData';
import { ExecutionTab } from '../ExecutionTab';
import { tabs } from '../constants';
import { NodeExecutionDetailsContextProvider } from '../../contextProvider/NodeExecutionDetails/NodeExecutionDetailsContextProvider';

const workflow = createWorkflowObject();

const QueryClientProvider: React.FC<React.PropsWithChildren<QueryClientProviderProps>> =
  QueryClientProviderImport;

jest.mock('../../../../queries/workflowQueries');
const { fetchWorkflow } = require('../../../../queries/workflowQueries');

jest.mock('../../../../components/common/DetailsPanel', () => ({
  DetailsPanel: jest.fn(({ children }) => <div data-testid="details-panel">{children}</div>),
}));

jest.mock('../../../../components/Executions/Tables/NodeExecutionsTable', () => ({
  NodeExecutionsTable: jest.fn(({ children }) => (
    <div data-testid="node-executions-table">{children}</div>
  )),
}));
jest.mock('../../../../components/Executions/ExecutionDetails/Timeline/ExecutionTimeline', () => ({
  ExecutionTimeline: jest.fn(({ children }) => (
    <div data-testid="execution-timeline">{children}</div>
  )),
}));
jest.mock(
  '../../../../components/Executions/ExecutionDetails/Timeline/ExecutionTimelineFooter',
  () => ({
    ExecutionTimelineFooter: jest.fn(({ children }) => (
      <div data-testid="execution-timeline-footer">{children}</div>
    )),
  }),
);
jest.mock('../../../../components/WorkflowGraph/WorkflowGraph', () => ({
  WorkflowGraph: jest.fn(({ children }) => <div data-testid="workflow-graph">{children}</div>),
}));

describe('Executions > ExecutionDetails > ExecutionTabContent', () => {
  let queryClient: QueryClient;
  let fixture: ReturnType<typeof basicPythonWorkflow.generate>;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    fixture = basicPythonWorkflow.generate();
    insertFixture(mockServer, fixture);
    fetchWorkflow.mockImplementation(() => Promise.resolve(fixture.workflows.top));
  });

  const renderTabContent = ({ tabType, nodeExecutionsById }) => {
    return render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <NodeExecutionDetailsContextProvider initialWorkflow={workflow}>
            <WorkflowNodeExecutionsContext.Provider value={nodeExecutionsById}>
              <ExecutionTab tabType={tabType} />
            </WorkflowNodeExecutionsContext.Provider>
          </NodeExecutionDetailsContextProvider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('renders NodeExecutionsTable when the Nodes tab is selected', async () => {
    const { queryByTestId } = renderTabContent({
      tabType: tabs.nodes.id,
      nodeExecutionsById: {},
    });

    await waitFor(() => queryByTestId('node-executions-table'));
    expect(queryByTestId('node-executions-table')).toBeInTheDocument();
  });

  it('renders WorkflowGraph when the Graph tab is selected', async () => {
    const { queryByTestId } = renderTabContent({
      tabType: tabs.graph.id,
      nodeExecutionsById: {},
    });

    await waitFor(() => queryByTestId('workflow-graph'));
    expect(queryByTestId('workflow-graph')).toBeInTheDocument();
  });

  it('renders ExecutionTimeline when the Timeline tab is selected', async () => {
    const { queryByTestId } = renderTabContent({
      tabType: tabs.timeline.id,
      nodeExecutionsById: {},
    });

    await waitFor(() => queryByTestId('execution-timeline'));
    expect(queryByTestId('execution-timeline')).toBeInTheDocument();
  });
});
