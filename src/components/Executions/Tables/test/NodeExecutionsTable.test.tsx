import {
    fireEvent,
    getAllByRole,
    getByText,
    getByTitle,
    render,
    waitFor
} from '@testing-library/react';
import { WaitForQuery } from 'components/common/WaitForQuery';
import {
    ExecutionContext,
    ExecutionContextData,
    NodeExecutionsRequestConfigContext
} from 'components/Executions/contexts';
import { useNodeExecutionListQuery } from 'components/Executions/nodeExecutionQueries';
import { cloneDeep } from 'lodash';
import { basicPythonWorkflow } from 'mocks/data/fixtures/basicPythonWorkflow';
import { dynamicExternalSubWorkflow } from 'mocks/data/fixtures/dynamicExternalSubworkflow';
import {
    dynamicPythonNodeExecutionWorkflow,
    dynamicPythonTaskWorkflow
} from 'mocks/data/fixtures/dynamicPythonWorkflow';
import { insertFixture } from 'mocks/data/insertFixture';
import { mockServer } from 'mocks/server';
import { Execution, NodeExecution, RequestConfig } from 'models';
import * as React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createTestQueryClient, findNearestAncestorByRole } from 'test/utils';
import { titleStrings } from '../constants';
import { NodeExecutionsTable } from '../NodeExecutionsTable';

describe('NodeExecutionsTable', () => {
    let fixture: ReturnType<typeof basicPythonWorkflow.generate>;
    let workflowExecution: Execution;
    let queryClient: QueryClient;
    let executionContext: ExecutionContextData;
    let requestConfig: RequestConfig;

    beforeEach(() => {
        fixture = basicPythonWorkflow.generate();
        workflowExecution = cloneDeep(fixture.workflowExecutions.top.data);
        insertFixture(mockServer, fixture);
        requestConfig = {};
        queryClient = createTestQueryClient();

        executionContext = {
            execution: workflowExecution
        };
    });

    const renderContent = (nodeExecutions: NodeExecution[]) => (
        <NodeExecutionsTable nodeExecutions={nodeExecutions} />
    );

    const TestTable = () => (
        <WaitForQuery
            query={useNodeExecutionListQuery(
                workflowExecution.id,
                requestConfig
            )}
        >
            {renderContent}
        </WaitForQuery>
    );

    const renderTable = () =>
        render(
            <QueryClientProvider client={queryClient}>
                <NodeExecutionsRequestConfigContext.Provider
                    value={requestConfig}
                >
                    <ExecutionContext.Provider value={executionContext}>
                        <TestTable />
                    </ExecutionContext.Provider>
                </NodeExecutionsRequestConfigContext.Provider>
            </QueryClientProvider>
        );

    describe('for basic executions', () => {
        let fixture: ReturnType<typeof basicPythonWorkflow.generate>;

        beforeEach(() => {
            fixture = basicPythonWorkflow.generate();
            workflowExecution = cloneDeep(fixture.workflowExecutions.top.data);
            insertFixture(mockServer, fixture);

            executionContext = {
                execution: workflowExecution
            };
        });
        it('renders task name for task nodes', async () => {
            const { getByText } = renderTable();
            await waitFor(() =>
                expect(
                    getByText(fixture.tasks.python.id.name)
                ).toBeInTheDocument()
            );
        });

        it('renders NodeExecutions with no associated spec information as Unknown', async () => {
            // TODO:
            // Create a NodeExecution that has no specNodeId, no metadata, and set up server
            // to return an empty list for task executions. This mimics the empty generator
            // nodes from dynamic workflows.
        });
    });

    describe('for nodes with children', () => {
        const expandParentNode = async (rowContainer: HTMLElement) => {
            const expander = await waitFor(() =>
                getByTitle(rowContainer, titleStrings.expandRow)
            );
            fireEvent.click(expander);
            return await waitFor(() => getAllByRole(rowContainer, 'list'));
        };

        describe('with isParentNode flag', () => {
            let fixture: ReturnType<typeof dynamicPythonNodeExecutionWorkflow.generate>;
            beforeEach(() => {
                fixture = dynamicPythonNodeExecutionWorkflow.generate();
                workflowExecution = fixture.workflowExecutions.top.data;
                insertFixture(mockServer, fixture);
                executionContext = { execution: workflowExecution };
            });

            it('correctly renders children', async () => {
                const { container } = renderTable();
                const dynamicTaskNameEl = await waitFor(() =>
                    getByText(container, fixture.tasks.dynamic.id.name)
                );
                const dynamicRowEl = findNearestAncestorByRole(
                    dynamicTaskNameEl,
                    'listitem'
                );
                const childContainerList = await expandParentNode(dynamicRowEl);
                await waitFor(() =>
                    expect(
                        getByText(
                            childContainerList[0],
                            fixture.tasks.python.id.name
                        )
                    )
                );
            });

            it('correctly renders groups', async () => {
                const { nodeExecutions } = fixture.workflowExecutions.top;
                // We returned two task execution attempts, each with children
                const { container } = renderTable();
                const nodeNameEl = await waitFor(() =>
                    getByText(
                        container,
                        nodeExecutions.dynamicNode.data.id.nodeId
                    )
                );
                const rowEl = findNearestAncestorByRole(nodeNameEl, 'listitem');
                const childGroups = await expandParentNode(rowEl);
                expect(childGroups).toHaveLength(2);
            });
        });

        describe('without isParentNode flag, using taskNodeMetadata ', () => {
            let fixture: ReturnType<typeof dynamicPythonTaskWorkflow.generate>;
            beforeEach(() => {
                fixture = dynamicPythonTaskWorkflow.generate();
                workflowExecution = cloneDeep(
                    fixture.workflowExecutions.top.data
                );
                executionContext = {
                    execution: workflowExecution
                };
            });

            it('correctly renders children', async () => {
                // The dynamic task node should have a single child node
                // which runs the basic python task. Expand it and then
                // look for the python task name to verify it was rendered.
                const { container } = renderTable();
                const dynamicTaskNameEl = await waitFor(() =>
                    getByText(container, fixture.tasks.dynamic.id.name)
                );
                const dynamicRowEl = findNearestAncestorByRole(
                    dynamicTaskNameEl,
                    'listitem'
                );
                const childContainerList = await expandParentNode(dynamicRowEl);
                await waitFor(() =>
                    expect(
                        getByText(
                            childContainerList[0],
                            fixture.tasks.python.id.name
                        )
                    )
                );
            });

            it('correctly renders groups', async () => {
                // We returned two task execution attempts, each with children
                const { container } = renderTable();
                const nodeNameEl = await waitFor(() =>
                    getByText(
                        container,
                        fixture.workflowExecutions.top.nodeExecutions
                            .dynamicNode.data.id.nodeId
                    )
                );
                const rowEl = findNearestAncestorByRole(nodeNameEl, 'listitem');
                const childGroups = await expandParentNode(rowEl);
                expect(childGroups).toHaveLength(2);
            });
        });

        describe('without isParentNode flag, using workflowNodeMetadata', () => {
            let fixture: ReturnType<typeof dynamicExternalSubWorkflow.generate>;
            beforeEach(() => {
                fixture = dynamicExternalSubWorkflow.generate();
                insertFixture(mockServer, fixture);
                workflowExecution = fixture.workflowExecutions.top.data;
                executionContext = {
                    execution: workflowExecution
                };
            });

            it('correctly renders children', async () => {
                const { container } = renderTable();
                const dynamicTaskNameEl = await waitFor(() =>
                    getByText(
                        container,
                        fixture.tasks.generateSubWorkflow.id.name
                    )
                );
                const dynamicRowEl = findNearestAncestorByRole(
                    dynamicTaskNameEl,
                    'listitem'
                );
                const childContainerList = await expandParentNode(dynamicRowEl);
                await waitFor(() =>
                    expect(
                        getByText(
                            childContainerList[0],
                            fixture.workflows.sub.id.name
                        )
                    )
                );
            });

            it('correctly renders groups', async () => {
                const parentNodeExecution =
                    fixture.workflowExecutions.top.nodeExecutions
                        .dynamicWorkflowGenerator.data;
                // We returned a single WF execution child, so there should only
                // be one child group
                const { container } = renderTable();
                const nodeNameEl = await waitFor(() =>
                    getByText(container, parentNodeExecution.id.nodeId)
                );
                const rowEl = findNearestAncestorByRole(nodeNameEl, 'listitem');
                const childGroups = await expandParentNode(rowEl);
                expect(childGroups).toHaveLength(1);
            });
        });
    });

    // TODO: Set a filter in the context and configure mockServer to return a different list for it
    // then check that the expected items were rendered.
    // it('requests child node executions using configuration from context', async () => {
    //     const { taskExecutions } = createMockTaskExecutionsListResponse(1);
    //     taskExecutions[0].isParent = true;
    //     mockListTaskExecutions.mockResolvedValue({ entities: taskExecutions });
    //     requestConfig.filter = [
    //         { key: 'test', operation: FilterOperationName.EQ, value: 'test' }
    //     ];

    //     await renderTable();
    //     await waitFor(() =>
    //         expect(mockListTaskExecutionChildren).toHaveBeenCalled()
    //     );

    //     expect(mockListTaskExecutionChildren).toHaveBeenCalledWith(
    //         taskExecutions[0].id,
    //         expect.objectContaining(requestConfig)
    //     );
    // });

    // describe('for task nodes with cache status', () => {
    //     let taskNodeMetadata: TaskNodeMetadata;
    //     let cachedNodeExecution: NodeExecution;
    //     beforeEach(() => {
    //         cachedNodeExecution = mockNodeExecutions[0];
    //         taskNodeMetadata = {
    //             cacheStatus: Core.CatalogCacheStatus.CACHE_MISS,
    //             catalogKey: {
    //                 datasetId: makeIdentifier({
    //                     resourceType: Core.ResourceType.DATASET
    //                 }),
    //                 sourceTaskExecution: { ...mockTaskExecution.id }
    //             }
    //         };
    //         cachedNodeExecution.closure.taskNodeMetadata = taskNodeMetadata;
    //     });

    //     [
    //         Core.CatalogCacheStatus.CACHE_HIT,
    //         Core.CatalogCacheStatus.CACHE_LOOKUP_FAILURE,
    //         Core.CatalogCacheStatus.CACHE_POPULATED,
    //         Core.CatalogCacheStatus.CACHE_PUT_FAILURE
    //     ].forEach(cacheStatusValue =>
    //         it(`renders correct icon for ${Core.CatalogCacheStatus[cacheStatusValue]}`, async () => {
    //             taskNodeMetadata.cacheStatus = cacheStatusValue;
    //             const { getByTitle } = await renderTable();
    //             await waitFor(() =>
    //                 getByTitle(cacheStatusMessages[cacheStatusValue])
    //             );
    //         })
    //     );

    //     [
    //         Core.CatalogCacheStatus.CACHE_DISABLED,
    //         Core.CatalogCacheStatus.CACHE_MISS
    //     ].forEach(cacheStatusValue =>
    //         it(`renders no icon for ${Core.CatalogCacheStatus[cacheStatusValue]}`, async () => {
    //             taskNodeMetadata.cacheStatus = cacheStatusValue;
    //             const { getByText, queryByTitle } = await renderTable();
    //             await waitFor(() => getByText(cachedNodeExecution.id.nodeId));
    //             expect(
    //                 queryByTitle(cacheStatusMessages[cacheStatusValue])
    //             ).toBeNull();
    //         })
    //     );
    // });

    // describe('when rendering the DetailsPanel', () => {
    //     beforeEach(() => {
    //         jest.useFakeTimers();
    //     });
    //     afterEach(() => {
    //         jest.clearAllTimers();
    //         jest.useRealTimers();
    //     });

    //     const selectFirstNode = async (container: HTMLElement) => {
    //         const { nodeId } = mockNodeExecutions[0].id;
    //         const nodeNameAnchor = await waitFor(() =>
    //             getByText(container, nodeId)
    //         );
    //         fireEvent.click(nodeNameAnchor);
    //         // Wait for Details Panel to render and then for the nodeId header
    //         const detailsPanel = await waitFor(() =>
    //             screen.getByTestId('details-panel')
    //         );
    //         await waitFor(() => getByText(detailsPanel, nodeId));
    //         return detailsPanel;
    //     };

    //     it('should render updated state if selected nodeExecution object changes', async () => {
    //         mockNodeExecutions[0].closure.phase = NodeExecutionPhase.RUNNING;
    //         // Render table, click first node
    //         const { container, rerender } = await renderTable();
    //         const detailsPanel = await selectFirstNode(container);
    //         await waitFor(() => getByText(detailsPanel, 'Running'));

    //         mockNodeExecutions = cloneDeep(mockNodeExecutions);
    //         mockNodeExecutions[0].closure.phase = NodeExecutionPhase.FAILED;
    //         setExecutionChildren({ id: mockExecution.id }, mockNodeExecutions);

    //         rerender(<Table {...await getProps()} />);
    //         await waitFor(() => getByText(detailsPanel, 'Failed'));
    //     });

    //     describe('with child executions', () => {
    //         let parentNodeExecution: NodeExecution;
    //         let childNodeExecutions: NodeExecution[];
    //         beforeEach(() => {
    //             parentNodeExecution = mockNodeExecutions[0];
    //             const id = parentNodeExecution.id;
    //             const { nodeId } = id;
    //             childNodeExecutions = [
    //                 {
    //                     ...parentNodeExecution,
    //                     id: { ...id, nodeId: `${nodeId}-child1` },
    //                     metadata: { retryGroup: '0', specNodeId: nodeId }
    //                 }
    //             ];
    //             mockNodeExecutions[0].metadata = { isParentNode: true };
    //             setExecutionChildren(
    //                 {
    //                     id: mockExecution.id,
    //                     parentNodeId: parentNodeExecution.id.nodeId
    //                 },
    //                 childNodeExecutions
    //             );
    //         });

    //         it('should correctly render details for nested executions', async () => {
    //             const { container } = await renderTable();
    //             const expander = await waitFor(() =>
    //                 getByTitle(container, titleStrings.expandRow)
    //             );
    //             fireEvent.click(expander);
    //             const { nodeId } = childNodeExecutions[0].id;
    //             const nodeNameAnchor = await waitFor(() =>
    //                 getByText(container, nodeId)
    //             );
    //             fireEvent.click(nodeNameAnchor);
    //             // Wait for Details Panel to render and then for the nodeId header
    //             const detailsPanel = await waitFor(() =>
    //                 screen.getByTestId('details-panel')
    //             );
    //             await waitFor(() => getByText(detailsPanel, nodeId));
    //         });
    //     });
    // });
});
