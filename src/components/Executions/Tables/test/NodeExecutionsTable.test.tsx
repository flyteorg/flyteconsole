import { render, waitFor } from '@testing-library/react';
import { mapNodeExecutionDetails } from 'components';
import { mockAPIContextValue } from 'components/data/__mocks__/apiContext';
import { APIContext } from 'components/data/apiContext';
import { NodeExecutionsRequestConfigContext } from 'components/Executions/contexts';
import { DetailedNodeExecution } from 'components/Executions/types';
import { FilterOperationName, RequestConfig } from 'models';
import {
    createMockWorkflow,
    createMockWorkflowClosure
} from 'models/__mocks__/workflowData';
import { createMockNodeExecutions } from 'models/Execution/__mocks__/mockNodeExecutionsData';
import { createMockTaskExecutionsListResponse } from 'models/Execution/__mocks__/mockTaskExecutionsData';
import {
    listTaskExecutionChildren,
    listTaskExecutions
} from 'models/Execution/api';
import { mockTasks } from 'models/Task/__mocks__/mockTaskData';
import * as React from 'react';
import {
    NodeExecutionsTable,
    NodeExecutionsTableProps
} from '../NodeExecutionsTable';

describe('NodeExecutionsTable', () => {
    let props: NodeExecutionsTableProps;
    let requestConfig: RequestConfig;
    let mockNodeExecutions: DetailedNodeExecution[];
    let mockListTaskExecutions: jest.Mock<ReturnType<
        typeof listTaskExecutions
    >>;
    let mockListTaskExecutionChildren: jest.Mock<ReturnType<
        typeof listTaskExecutionChildren
    >>;

    beforeEach(() => {
        mockListTaskExecutions = jest.fn().mockResolvedValue({ entities: [] });
        mockListTaskExecutionChildren = jest
            .fn()
            .mockResolvedValue({ entities: [] });
        const {
            executions: mockExecutions,
            nodes: mockNodes
        } = createMockNodeExecutions(1);

        const mockWorkflow = createMockWorkflow('SampleWorkflow');
        const mockWorkflowClosure = createMockWorkflowClosure();
        const compiledWorkflow = mockWorkflowClosure.compiledWorkflow!;
        const {
            primary: { template },
            tasks
        } = compiledWorkflow;
        template.nodes = template.nodes.concat(mockNodes);
        compiledWorkflow.tasks = tasks.concat(mockTasks);
        mockWorkflow.closure = mockWorkflowClosure;

        mockNodeExecutions = mapNodeExecutionDetails(
            mockExecutions,
            mockWorkflow
        );

        requestConfig = {};

        props = {
            value: mockNodeExecutions,
            lastError: null,
            loading: false,
            moreItemsAvailable: false,
            fetch: jest.fn()
        };
    });

    const renderTable = () =>
        render(
            <APIContext.Provider
                value={mockAPIContextValue({
                    listTaskExecutions: mockListTaskExecutions,
                    listTaskExecutionChildren: mockListTaskExecutionChildren
                })}
            >
                <NodeExecutionsRequestConfigContext.Provider
                    value={requestConfig}
                >
                    <NodeExecutionsTable {...props} />
                </NodeExecutionsRequestConfigContext.Provider>
            </APIContext.Provider>
        );

    it('renders displayId for nodes', async () => {
        const { queryByText } = renderTable();
        await waitFor(() => {});

        const node = mockNodeExecutions[0];
        expect(queryByText(node.displayId)).toBeInTheDocument();
    });

    it('requests child node executions using configuration from context', async () => {
        const { taskExecutions } = createMockTaskExecutionsListResponse(1);
        taskExecutions[0].isParent = true;
        mockListTaskExecutions.mockResolvedValue({ entities: taskExecutions });
        requestConfig.filter = [
            { key: 'test', operation: FilterOperationName.EQ, value: 'test' }
        ];
        renderTable();
        await waitFor(() => {});

        expect(mockListTaskExecutionChildren).toHaveBeenCalledWith(
            taskExecutions[0].id,
            expect.objectContaining(requestConfig)
        );
    });
});
