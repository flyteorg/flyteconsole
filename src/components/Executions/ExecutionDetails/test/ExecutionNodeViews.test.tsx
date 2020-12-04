import { render } from '@testing-library/react';
import { createQueryClient } from 'components/data/queryCache';
import { createMockExecutionEntities } from 'components/Executions/__mocks__/createMockExecutionEntities';
import * as React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
    ExecutionNodeViews,
    ExecutionNodeViewsProps
} from '../ExecutionNodeViews';

// We don't need to verify the content of the graph component here and it is
// difficult to make it work correctly in a test environment.
jest.mock('../ExecutionWorkflowGraph.tsx', () => ({
    ExecutionWorkflowGraph: () => null
}));

// TODO: Update this to use MSW and re-enable
describe.skip('ExecutionNodeViews', () => {
    let queryClient: QueryClient;
    let props: ExecutionNodeViewsProps;

    beforeEach(() => {
        queryClient = createQueryClient();
        const { workflowExecution } = createMockExecutionEntities({
            workflowName: 'SampleWorkflow',
            nodeExecutionCount: 2
        });

        props = { execution: workflowExecution };
    });

    const renderViews = () =>
        render(
            <QueryClientProvider client={queryClient}>
                <ExecutionNodeViews {...props} />
            </QueryClientProvider>
        );

    // it('only applies filter when viewing the nodes tab', async () => {
    //     const { getByText } = renderViews();
    //     const nodesTab = await waitFor(() => getByText(tabs.nodes.label));
    //     const graphTab = await waitFor(() => getByText(tabs.graph.label));

    //     fireEvent.click(nodesTab);
    //     const statusButton = await waitFor(() =>
    //         getByText(filterLabels.status)
    //     );
    //     fireEvent.click(statusButton);
    //     const successFilter = await waitFor(() =>
    //         getByText(nodeExecutionStatusFilters.succeeded.label)
    //     );

    //     mockListNodeExecutions.mockClear();
    //     fireEvent.click(successFilter);
    //     await waitFor(() => mockListNodeExecutions.mock.calls.length > 0);
    //     // Verify at least one filter is passed
    //     expect(mockListNodeExecutions).toHaveBeenCalledWith(
    //         expect.anything(),
    //         expect.objectContaining({
    //             filter: expect.arrayContaining([
    //                 expect.objectContaining({ key: expect.any(String) })
    //             ])
    //         })
    //     );

    //     fireEvent.click(statusButton);
    //     await waitForElementToBeRemoved(successFilter);
    //     mockListNodeExecutions.mockClear();
    //     fireEvent.click(graphTab);
    //     await waitFor(() => mockListNodeExecutions.mock.calls.length > 0);
    //     // No filter expected on the graph tab
    //     expect(mockListNodeExecutions).toHaveBeenCalledWith(
    //         expect.anything(),
    //         expect.objectContaining({ filter: [] })
    //     );

    //     mockListNodeExecutions.mockClear();
    //     fireEvent.click(nodesTab);
    //     await waitFor(() => mockListNodeExecutions.mock.calls.length > 0);
    //     // Verify (again) at least one filter is passed, after changing back to
    //     // nodes tab.
    //     expect(mockListNodeExecutions).toHaveBeenCalledWith(
    //         expect.anything(),
    //         expect.objectContaining({
    //             filter: expect.arrayContaining([
    //                 expect.objectContaining({ key: expect.any(String) })
    //             ])
    //         })
    //     );
    // });
});
