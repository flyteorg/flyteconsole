import { log } from 'common/log';
import { getCacheKey } from 'components/Cache';
import { QueryType } from 'components/data/queries';
import { fetchTaskTemplate } from 'components/Task/taskQueries';
import { fetchWorkflow } from 'components/Workflow/workflowQueries';
import {
    CompiledNode,
    CompiledWorkflow,
    Identifier,
    NodeExecution,
    TaskTemplate,
    TaskType,
    Workflow
} from 'models';
import { QueryClient, useQuery, useQueryClient } from 'react-query';
import { taskTypeToNodeExecutionDisplayType } from '.';
import { fetchTaskExecutionList } from './taskExecutionQueries';
import {
    CompiledBranchNode,
    CompiledTaskNode,
    CompiledWorkflowNode,
    NodeExecutionDetails,
    NodeExecutionDisplayType,
    WorkflowNodeExecution
} from './types';
import { fetchWorkflowExecution } from './useWorkflowExecution';
import { getNodeExecutionSpecId } from './utils';

// TODO: Move helpers
function isWorkflowNodeExecution(
    nodeExecution: NodeExecution
): nodeExecution is WorkflowNodeExecution {
    return nodeExecution.closure.workflowNodeMetadata != null;
}

function isCompiledTaskNode(node: CompiledNode): node is CompiledTaskNode {
    return node.taskNode != null;
}

function isCompiledWorkflowNode(
    node: CompiledNode
): node is CompiledWorkflowNode {
    return node.workflowNode != null;
}

function isCompiledBranchNode(node: CompiledNode): node is CompiledBranchNode {
    return node.branchNode != null;
}

// TODO: Look into removing the cacheKey prop from NE details. Probably unnecessary at this point.
function createExternalWorkflowNodeExecutionDetails(
    nodeExecution: NodeExecution,
    workflow: Workflow
): NodeExecutionDetails {
    return {
        cacheKey: getCacheKey(nodeExecution.id),
        displayId: workflow.id.name,
        displayType: NodeExecutionDisplayType.Workflow
    };
}

function createWorkflowNodeExecutionDetails(
    nodeExecution: NodeExecution,
    node: CompiledWorkflowNode
): NodeExecutionDetails {
    const displayType = NodeExecutionDisplayType.Workflow;
    let displayId = '';
    const { launchplanRef, subWorkflowRef } = node.workflowNode;
    const identifier = (launchplanRef
        ? launchplanRef
        : subWorkflowRef) as Identifier;
    if (!identifier) {
        log.warn(
            `Unexpected workflow node with no ref: ${getNodeExecutionSpecId(
                nodeExecution
            )}`
        );
    } else {
        displayId = identifier.name;
    }

    return {
        displayId,
        displayType,
        cacheKey: getCacheKey(nodeExecution.id)
    };
}

// TODO: Decide or document what information we want to show in the future about branch nodes (name? conditions?)
function createBranchNodeExecutionDetails(
    nodeExecution: NodeExecution,
    node: CompiledBranchNode
): NodeExecutionDetails {
    return {
        cacheKey: getCacheKey(nodeExecution.id),
        displayId: '',
        displayType: NodeExecutionDisplayType.BranchNode
    };
}

function createTaskNodeExecutionDetails(
    nodeExecution: NodeExecution,
    taskTemplate: TaskTemplate
): NodeExecutionDetails {
    return {
        // TODO: I think we can remove this here since code that needs the template can fetch
        // it relatively cheaply from the query cache.
        taskTemplate,
        cacheKey: getCacheKey(nodeExecution.id),
        displayId: taskTemplate.id.name,
        displayType:
            taskTypeToNodeExecutionDisplayType[taskTemplate.type as TaskType] ??
            NodeExecutionDisplayType.UnknownTask
    };
}

function createUnknownNodeExecutionDetails(
    nodeExecution: NodeExecution
): NodeExecutionDetails {
    return {
        cacheKey: getCacheKey(nodeExecution.id),
        displayId: '',
        displayType: NodeExecutionDisplayType.Unknown
    };
}

// TODO: Try/catches for all of these fetch functions which default back to unknown node display type.
// Potentially just add a single catch at the top so that each of these node execution details functions doesn't need its own
// case for generating unknown node details
async function fetchExternalWorkflowNodeExecutionDetails(
    queryClient: QueryClient,
    nodeExecution: WorkflowNodeExecution
): Promise<NodeExecutionDetails> {
    const workflowExecution = await fetchWorkflowExecution(
        queryClient,
        nodeExecution.closure.workflowNodeMetadata.executionId
    );
    const workflow = await fetchWorkflow(
        queryClient,
        workflowExecution.closure.workflowId
    );

    return createExternalWorkflowNodeExecutionDetails(nodeExecution, workflow);
}

function findCompiledNode(
    nodeId: string,
    compiledWorkflows: CompiledWorkflow[]
) {
    for (let i = 0; i < compiledWorkflows.length; i += 1) {
        const found = compiledWorkflows[i].template.nodes.find(
            ({ id }) => id === nodeId
        );
        if (found) {
            return found;
        }
    }
    return undefined;
}

function findNodeInWorkflow(
    nodeId: string,
    workflow: Workflow
): CompiledNode | undefined {
    if (!workflow.closure?.compiledWorkflow) {
        return undefined;
    }
    const { primary, subWorkflows = [] } = workflow.closure?.compiledWorkflow;
    return findCompiledNode(nodeId, [primary, ...subWorkflows]);
}

async function fetchTaskNodeExecutionDetails(
    queryClient: QueryClient,
    nodeExecution: NodeExecution,
    taskId: Identifier
) {
    const taskTemplate = await fetchTaskTemplate(queryClient, taskId);
    if (!taskTemplate) {
        throw new Error(
            `Unexpected missing task template while fetching NodeExecution details: ${JSON.stringify(
                taskId
            )}`
        );
    }
    return createTaskNodeExecutionDetails(nodeExecution, taskTemplate);
}

async function fetchNodeExecutionDetailsFromNodeSpec(
    queryClient: QueryClient,
    nodeExecution: NodeExecution
): Promise<NodeExecutionDetails> {
    const nodeId = getNodeExecutionSpecId(nodeExecution);
    const workflowExecution = await fetchWorkflowExecution(
        queryClient,
        nodeExecution.id.executionId
    );
    const workflow = await fetchWorkflow(
        queryClient,
        workflowExecution.closure.workflowId
    );

    // If the source workflow spec has a node matching this execution, we
    // can parse out the node information and set our details based on that.
    const compiledNode = findNodeInWorkflow(nodeId, workflow);
    if (compiledNode) {
        if (isCompiledTaskNode(compiledNode)) {
            return fetchTaskNodeExecutionDetails(
                queryClient,
                nodeExecution,
                compiledNode.taskNode.referenceId
            );
        }
        if (isCompiledWorkflowNode(compiledNode)) {
            return createWorkflowNodeExecutionDetails(
                nodeExecution,
                compiledNode
            );
        }
        if (isCompiledBranchNode(compiledNode)) {
            return createBranchNodeExecutionDetails(
                nodeExecution,
                compiledNode
            );
        }
    }

    // Fall back to attempting to locate a task execution for this node and
    // subsequently fetching its task spec.
    const taskExecutions = await fetchTaskExecutionList(
        queryClient,
        nodeExecution.id
    );
    if (taskExecutions.length > 0) {
        return fetchTaskNodeExecutionDetails(
            queryClient,
            nodeExecution,
            taskExecutions[0].id.taskId
        );
    }

    return createUnknownNodeExecutionDetails(nodeExecution);
}

async function doFetchNodeExecutionDetails(
    queryClient: QueryClient,
    nodeExecution: NodeExecution
) {
    try {
        if (isWorkflowNodeExecution(nodeExecution)) {
            return fetchExternalWorkflowNodeExecutionDetails(
                queryClient,
                nodeExecution
            );
        }

        // Attempt to find node information in the source workflow spec
        // or via any associated TaskExecution's task spec.
        return fetchNodeExecutionDetailsFromNodeSpec(
            queryClient,
            nodeExecution
        );
    } catch (e) {
        return createUnknownNodeExecutionDetails(nodeExecution);
    }
}

export function fetchNodeExecutionDetails(
    queryClient: QueryClient,
    nodeExecution: NodeExecution
) {
    return queryClient.fetchQuery({
        queryKey: [QueryType.NodeExecutionDetails, nodeExecution.id],
        queryFn: () => doFetchNodeExecutionDetails(queryClient, nodeExecution)
    });
}

export function useNodeExecutionDetails(nodeExecution?: NodeExecution) {
    const queryClient = useQueryClient();
    return useQuery<NodeExecutionDetails, Error>({
        enabled: !!nodeExecution,
        // Once we successfully map these details, we don't need to do it again.
        staleTime: Infinity,
        queryKey: [QueryType.NodeExecutionDetails, nodeExecution?.id],
        queryFn: () => doFetchNodeExecutionDetails(queryClient, nodeExecution!)
    });
}
