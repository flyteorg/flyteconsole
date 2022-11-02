import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { filterLabels } from 'components/Executions/filters/constants';
import { nodeExecutionStatusFilters } from 'components/Executions/filters/statusFilters';
import { oneFailedTaskWorkflow } from 'mocks/data/fixtures/oneFailedTaskWorkflow';
import { insertFixture } from 'mocks/data/insertFixture';
import { mockServer } from 'mocks/server';
import { Execution, FeatureFlag } from '@flyteconsole/components';
import * as React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createTestQueryClient } from 'test/utils';
import { tabs } from '../constants';
import { ExecutionNodeViews } from '../ExecutionNodeViews';

declare global {
  interface Window {
    setFeatureFlag: (flag: FeatureFlag, newValue: boolean) => void;
    getFeatureFlag: (flag: FeatureFlag) => boolean;
    clearRuntimeConfig: () => void;
  }
}

jest.mock('chart.js', () => ({
  Chart: { register: () => null },
  Tooltip: { positioners: { cursor: () => null } },
  registerables: [],
}));

jest.mock('chartjs-plugin-datalabels', () => ({
  ChartDataLabels: null,
}));

jest.mock('react-router-dom', () => ({
  useHistory: jest.fn().mockReturnValue({
    location: {
      pathname: '',
      search: '',
      hash: '',
      state: null,
      key: 'flytetest',
    },
    listen: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  }),
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

    mockServer.insertNodeExecutionList(
      execution.id,
      Object.values(nodeExecutions).map(({ data }) => data),
      baseQueryParams,
    );
    mockServer.insertNodeExecutionList(execution.id, [nodeExecutions.failedNode.data], {
      ...baseQueryParams,
      filters: 'value_in(phase,FAILED)',
    });
    queryClient = createTestQueryClient();
  });

  const renderViews = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <ExecutionNodeViews execution={execution} />
      </QueryClientProvider>,
    );

  it('maintains filter when switching back to nodes tab', async () => {
    const { nodeExecutions } = fixture.workflowExecutions.top;
    const failedNodeName = nodeExecutions.failedNode.data.id.nodeId;
    const succeededNodeName = nodeExecutions.pythonNode.data.id.nodeId;

    const { getByText, queryByText } = renderViews();
    const nodesTab = await waitFor(() => getByText(tabs.nodes.label));
    const graphTab = await waitFor(() => getByText(tabs.graph.label));

    // Ensure we are on Nodes tab
    await fireEvent.click(nodesTab);
    await waitFor(() => getByText(succeededNodeName));

    const statusButton = await waitFor(() => getByText(filterLabels.status));

    // Apply 'Failed' filter and wait for list to include only the failed item
    await fireEvent.click(statusButton);
    const failedFilter = await waitFor(() =>
      screen.getByLabelText(nodeExecutionStatusFilters.failed.label),
    );

    // Wait for succeeded task to disappear and ensure failed task remains
    await fireEvent.click(failedFilter);
    await waitFor(() => queryByText(succeededNodeName) == null);
    await waitFor(() => expect(getByText(failedNodeName)).toBeInTheDocument());

    // Switch to the Graph tab
    await fireEvent.click(statusButton);
    await fireEvent.click(graphTab);
    await waitFor(() => queryByText(failedNodeName) == null);

    // Switch back to Nodes Tab and verify filter still applied
    await fireEvent.click(nodesTab);
    await waitFor(() => getByText(failedNodeName));
    expect(queryByText(succeededNodeName)).toBeNull();
  });
});
