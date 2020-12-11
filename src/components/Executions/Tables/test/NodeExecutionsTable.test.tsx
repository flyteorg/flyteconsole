import {
    fireEvent,
    getAllByRole,
    getByText,
    getByTitle,
    render,
    screen,
    waitFor
} from '@testing-library/react';
import { getCacheKey } from 'components/Cache';
import { mockAPIContextValue } from 'components/data/__mocks__/apiContext';
import { APIContext, APIContextValue } from 'components/data/apiContext';
import { createMockExecutionEntities } from 'components/Executions/__mocks__/createMockExecutionEntities';
import { cacheStatusMessages } from 'components/Executions/constants';
import {
    ExecutionContext,
    ExecutionContextData,
    NodeExecutionsRequestConfigContext
} from 'components/Executions/contexts';
import { fetchStates } from 'components/hooks';
import { Core } from 'flyteidl';
import { cloneDeep, isEqual } from 'lodash';
import {
    CompiledNode,
    Execution,
    FilterOperationName,
    getTask,
    getWorkflow,
    NodeExecution,
    NodeExecutionMetadata,
    nodeExecutionQueryParams,
    RequestConfig,
    Task,
    TaskExecution,
    TaskNodeMetadata,
    Workflow,
    WorkflowExecutionIdentifier
} from 'models';
import { createMockExecution } from 'models/__mocks__/executionsData';
import {
    createMockTaskExecutionForNodeExecution,
    createMockTaskExecutionsListResponse,
    mockExecution as mockTaskExecution
} from 'models/Execution/__mocks__/mockTaskExecutionsData';
import {
    getExecution,
    listNodeExecutions,
    listTaskExecutionChildren,
    listTaskExecutions
} from 'models/Execution/api';
import { NodeExecutionPhase } from 'models/Execution/enums';
import { mockTasks } from 'models/Task/__mocks__/mockTaskData';
import * as React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { makeIdentifier } from 'test/modelUtils';
import {
    createTestQueryClient,
    findNearestAncestorByRole,
    obj
} from 'test/utils';
import { titleStrings } from '../constants';
import {
    NodeExecutionsTable,
    NodeExecutionsTableProps
} from '../NodeExecutionsTable';
import { workflowExecutions } from 'mocks/data/workflowExecutions';
import {
    fetchNodeExecutionList,
    fetchTaskExecutionChildList,
    useNodeExecutionListQuery
} from 'components/Executions/nodeExecutionQueries';
import { WaitForQuery } from 'components/common/WaitForQuery';
import { tasks } from 'mocks/data/tasks';
import { mockServer } from 'mocks/server';
import { taskExecutions } from 'mocks/data/taskExecutions';
import { nodeExecutions } from 'mocks/data/nodeExecutions';

describe('NodeExecutionsTable', () => {
    let workflowExecution: Execution;
    let queryClient: QueryClient;
    let executionContext: ExecutionContextData;
    let requestConfig: RequestConfig;

    beforeEach(() => {
        workflowExecution = cloneDeep(workflowExecutions.basic);
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

    it('renders task name for task nodes', async () => {
        const { getByText } = renderTable();
        await waitFor(() =>
            expect(getByText(tasks.basicPython.id.name)).toBeInTheDocument()
        );
    });

    it('renders NodeExecutions with no associated spec information as Unknown', async () => {
        // TODO:
        // Create a NodeExecution that has no specNodeId, no metadata, and set up server
        // to return an empty list for task executions. This mimics the empty generator
        // nodes from dynamic workflows.
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
            beforeEach(() => {
                workflowExecution = cloneDeep(workflowExecutions.nestedDynamic);
                executionContext = {
                    execution: workflowExecution
                };
                const parentNodeExecution = cloneDeep(
                    nodeExecutions.dynamicNode
                );
                parentNodeExecution.metadata = {
                    isParentNode: true,
                    retryGroup: '0',
                    specNodeId: parentNodeExecution.id.nodeId
                };
                const parentTaskExecution = cloneDeep(
                    taskExecutions.dynamicNode
                );
                parentTaskExecution.isParent = false;
                const childNode = (
                    nodeIdSuffix: string,
                    retryGroup: string
                ) => {
                    const result = cloneDeep(
                        nodeExecutions.dynamicChildPythonNode
                    );
                    result.id.nodeId += nodeIdSuffix;
                    result.metadata = {
                        retryGroup,
                        isParentNode: false,
                        specNodeId:
                            nodeExecutions.dynamicChildPythonNode.id.nodeId
                    };
                    return result;
                };

                const childNodeExecutions: NodeExecution[] = [
                    childNode('_child0_1', '0'),
                    childNode('_child1_1', '1')
                ];

                mockServer.insertNodeExecutionList(workflowExecution.id, [parentNodeExecution]);
                mockServer.insertTaskExecution(parentTaskExecution);
                mockServer.insertNodeExecution(parentNodeExecution);
                mockServer.insertTaskExecutionList(parentNodeExecution.id, [
                    parentTaskExecution
                ]);
                childNodeExecutions.forEach(ne => {
                    mockServer.insertNodeExecution(ne);
                    mockServer.insertTaskExecutionList(ne.id, [taskExecutions.dynamicChildPythonNode]);
                });
                mockServer.insertNodeExecutionList(
                    parentNodeExecution.id.executionId,
                    childNodeExecutions,
                    {
                        [nodeExecutionQueryParams.parentNodeId]:
                            parentNodeExecution.id.nodeId
                    }
                );
            });

            it('correctly renders children', async () => {
                const { container } = renderTable();
                const dynamicTaskNameEl = await waitFor(() =>
                    getByText(container, tasks.dynamic.id.name)
                );
                const dynamicRowEl = findNearestAncestorByRole(
                    dynamicTaskNameEl,
                    'listitem'
                );
                const childContainerList = await expandParentNode(dynamicRowEl);
                await waitFor(() =>
                    expect(getByText(childContainerList[0], tasks.basicPython.id.name))
                );
            });

            it('correctly renders groups', async () => {
                // We returned two task execution attempts, each with children
                const { container } = renderTable();
                const nodeNameEl = await waitFor(() =>
                    getByText(container, nodeExecutions.dynamicNode.id.nodeId)
                );
                const rowEl = findNearestAncestorByRole(nodeNameEl, 'listitem');
                const childGroups = await expandParentNode(rowEl);
                expect(childGroups).toHaveLength(2);
            });
        });

        describe('without isParentNode flag, using taskNodeMetadata ', () => {
            beforeEach(() => {
                workflowExecution = cloneDeep(workflowExecutions.nestedDynamic);
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
                    getByText(container, tasks.dynamic.id.name)
                );
                const dynamicRowEl = findNearestAncestorByRole(
                    dynamicTaskNameEl,
                    'listitem'
                );
                const childContainerList = await expandParentNode(dynamicRowEl);
                await waitFor(() =>
                    expect(getByText(childContainerList[0], tasks.basicPython.id.name))
                );
            });

            it('correctly renders groups', async () => {
                const firstTaskRetry = cloneDeep(taskExecutions.dynamicNode);
                firstTaskRetry.id.retryAttempt = 1;
                mockServer.insertTaskExecution(firstTaskRetry);
                mockServer.insertTaskExecutionList(
                    nodeExecutions.dynamicNode.id,
                    [taskExecutions.dynamicNode, firstTaskRetry]
                );
                mockServer.insertTaskExecutionChildList(firstTaskRetry.id, [
                    nodeExecutions.dynamicChildPythonNode
                ]);
                // We returned two task execution attempts, each with children
                const { container } = renderTable();
                const nodeNameEl = await waitFor(() =>
                    getByText(container, nodeExecutions.dynamicNode.id.nodeId)
                );
                const rowEl = findNearestAncestorByRole(nodeNameEl, 'listitem');
                const childGroups = await expandParentNode(rowEl);
                expect(childGroups).toHaveLength(2);
            });
        });

        describe('without isParentNode flag, using workflowNodeMetadata', () => {
            beforeEach(() => {
                workflowExecution = cloneDeep(workflowExecutions.nestedDynamic);
                executionContext = {
                    execution: workflowExecution
                };
                // TODO: Create a workflow/task/WFE/NE/TE which launches an external
                // worfklow. Set workflowNodeMetadata on the parent node execution,
                // point it to the basic workflow

                // childExecution = cloneDeep(executionContext.execution);
                // childExecution.id.name = 'childExecution';
                // dataCache.insertExecution(childExecution);
                // dataCache.insertWorkflowExecutionReference(
                //     childExecution.id,
                //     mockWorkflow.id
                // );

                // childNodeExecutions = cloneDeep(mockNodeExecutions);
                // childNodeExecutions.forEach(
                //     ne => (ne.id.executionId = childExecution.id)
                // );
                // mockNodeExecutions[0].closure.workflowNodeMetadata = {
                //     executionId: childExecution.id
                // };
                // mockGetExecution.mockImplementation(async id => {
                //     if (isEqual(id, childExecution.id)) {
                //         return childExecution;
                //     }
                //     if (isEqual(id, mockExecution.id)) {
                //         return mockExecution;
                //     }

                //     throw new Error(
                //         `Unexpected call to getExecution with execution id: ${obj(
                //             id
                //         )}`
                //     );
                // });
                // setExecutionChildren(
                //     { id: childExecution.id },
                //     childNodeExecutions
                // );
            });

            // it('correctly fetches children', async () => {
            //     const { getByText } = await renderTable();
            //     await waitFor(() => getByText(mockNodeExecutions[0].id.nodeId));
            //     expect(mockListNodeExecutions).toHaveBeenCalledWith(
            //         expect.objectContaining({ name: childExecution.id.name }),
            //         expect.anything()
            //     );
            // });

            // it('correctly renders groups', async () => {
            //     // We returned a single WF execution child, so there should only
            //     // be one child group
            //     const { container } = await renderTable();
            //     const childGroups = await expandParentNode(container);
            //     expect(childGroups).toHaveLength(1);
            // });
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
