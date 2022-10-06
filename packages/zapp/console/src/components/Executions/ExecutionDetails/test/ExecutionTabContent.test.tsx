import { render, waitFor } from '@testing-library/react';
import { NodeExecutionDetailsContextProvider } from 'components/Executions/contextProvider/NodeExecutionDetails';
import { NodeExecutionsByIdContext } from 'components/Executions/contexts';
import { basicPythonWorkflow } from 'mocks/data/fixtures/basicPythonWorkflow';
import { mockWorkflowId } from 'mocks/data/fixtures/types';
import { insertFixture } from 'mocks/data/insertFixture';
import { mockServer } from 'mocks/server';
import * as React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createTestQueryClient } from 'test/utils';
import { ExecutionTabContent } from '../ExecutionTabContent';
import { tabs } from '../constants';

jest.mock('components/Workflow/workflowQueries');
const { fetchWorkflow } = require('components/Workflow/workflowQueries');

jest.mock('components/common/DetailsPanel', () => ({
  DetailsPanel: jest.fn(({ children }) => <div data-testid="details-panel">{children}</div>),
}));

jest.mock('components/Executions/Tables/NodeExecutionsTable', () => ({
  NodeExecutionsTable: jest.fn(({ children }) => (
    <div data-testid="node-executions-table">{children}</div>
  )),
}));
jest.mock('components/Executions/ExecutionDetails/Timeline/ExecutionTimeline', () => ({
  ExecutionTimeline: jest.fn(({ children }) => (
    <div data-testid="execution-timeline">{children}</div>
  )),
}));
jest.mock('components/Executions/ExecutionDetails/Timeline/ExecutionTimelineFooter', () => ({
  ExecutionTimelineFooter: jest.fn(({ children }) => (
    <div data-testid="execution-timeline-footer">{children}</div>
  )),
}));
jest.mock('components/WorkflowGraph/WorkflowGraph', () => ({
  WorkflowGraph: jest.fn(({ children }) => <div data-testid="workflow-graph">{children}</div>),
}));

describe('Executions > ExecutionDetails > ExecutionTabContent', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
  });

  const renderTabContent = ({ tabType, nodeExecutionsById }) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <NodeExecutionDetailsContextProvider workflowId={mockWorkflowId}>
          <NodeExecutionsByIdContext.Provider value={nodeExecutionsById}>
            <ExecutionTabContent tabType={tabType} />
          </NodeExecutionsByIdContext.Provider>
        </NodeExecutionDetailsContextProvider>
      </QueryClientProvider>,
    );
  };

  describe('when rendering the tabContent', () => {
    let fixture: ReturnType<typeof basicPythonWorkflow.generate>;

    beforeEach(() => {
      fixture = basicPythonWorkflow.generate();
      insertFixture(mockServer, fixture);
      fetchWorkflow.mockImplementation(() => Promise.resolve(fixture.workflows.top));
    });

    it('renders NodeExecutionsTable when the Nodes tab is selected', async () => {
      const { container, getByTestId } = renderTabContent({
        tabType: tabs.nodes.id,
        nodeExecutionsById: {},
      });

      await waitFor(() => container);
      expect(getByTestId('node-executions-table')).toBeInTheDocument();
    });

    it('renders WorkflowGraph when the Graph tab is selected', async () => {
      const { container, getByTestId } = renderTabContent({
        tabType: tabs.graph.id,
        nodeExecutionsById: {},
      });

      await waitFor(() => container);
      expect(getByTestId('workflow-graph')).toBeInTheDocument();
    });

    it('renders ExecutionTimeline when the Timeline tab is selected', async () => {
      const { container, getByTestId } = renderTabContent({
        tabType: tabs.timeline.id,
        nodeExecutionsById: {},
      });

      await waitFor(() => container);
      expect(getByTestId('execution-timeline')).toBeInTheDocument();
    });
  });
});
