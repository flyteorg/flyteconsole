import {
    Task,
    Binding,
    Workflow,
    ResourceType,
    LaunchPlan,
    NodeExecutionIdentifier,
    WorkflowExecutionIdentifier,
    NodeExecution,
    TaskLog,
    TaskExecutionIdentifier,
    TaskNode
} from 'models';
import { dataUriPrefix, testDomain, testProject } from './constants';

interface TaskNodeIdsResult {
    id: string;
    taskNode: Pick<TaskNode, 'referenceId'>;
}
export function taskNodeIds(id: string, task: Task): TaskNodeIdsResult {
    return {
        id,
        taskNode: { referenceId: { ...task.id } }
    };
}

export function bindingFromNode(
    inputName: string,
    upstreamNodeId: string,
    upstreamInputName: string
): Binding {
    return {
        var: inputName,
        binding: {
            promise: {
                nodeId: upstreamNodeId,
                var: upstreamInputName
            }
        }
    };
}

export function makeDefaultLaunchPlan(workflow: Workflow): LaunchPlan {
    return {
        id: {
            resourceType: ResourceType.LAUNCH_PLAN,
            project: testProject,
            domain: testDomain,
            name: workflow.id.name,
            version: workflow.id.version
        },
        spec: {
            defaultInputs: { parameters: {} },
            entityMetadata: { notifications: [], schedule: {} },
            fixedInputs: { literals: {} },
            role: 'defaultRole',
            workflowId: { ...workflow.id }
        }
    };
}

export function makeNodeExecutionInputUri({
    executionId: { project, domain, name },
    nodeId
}: NodeExecutionIdentifier): string {
    return `${dataUriPrefix}/${project}_${domain}_${name}_${nodeId}/inputs.pb`;
}

export function makeNodeExecutionOutputUri({
    executionId: { project, domain, name },
    nodeId
}: NodeExecutionIdentifier): string {
    return `${dataUriPrefix}/${project}_${domain}_${name}_${nodeId}/outputs.pb`;
}

export function nodeExecutionId(
    executionId: WorkflowExecutionIdentifier,
    nodeId: string
): NodeExecutionIdentifier {
    return {
        nodeId,
        executionId: { ...executionId }
    };
}

export function sampleLogs(): TaskLog[] {
    return [
        { name: 'Kubernetes Logs', uri: 'http://localhost/k8stasklog' },
        { name: 'User Logs', uri: 'http://localhost/containerlog' },
        { name: 'AWS Batch Logs', uri: 'http://localhost/awsbatchlog' },
        { name: 'Other Custom Logs', uri: 'http://localhost/customlog' }
    ];
}

export function taskExecutionId(
    nodeExecution: NodeExecution,
    task: Task,
    retryAttempt = 0
): TaskExecutionIdentifier {
    return {
        retryAttempt,
        nodeExecutionId: { ...nodeExecution.id },
        taskId: { ...task.id }
    };
}

export function makeTaskExecutionInputUri({
    nodeExecutionId: {
        executionId: { project, domain, name },
        nodeId
    },
    retryAttempt
}: TaskExecutionIdentifier): string {
    return `${dataUriPrefix}/${project}_${domain}_${name}_${nodeId}_${retryAttempt}/inputs.pb`;
}

export function makeTaskExecutionOutputUri({
    nodeExecutionId: {
        executionId: { project, domain, name },
        nodeId
    },
    retryAttempt
}: TaskExecutionIdentifier): string {
    return `${dataUriPrefix}/${project}_${domain}_${name}_${nodeId}_${retryAttempt}/outputs.pb`;
}
