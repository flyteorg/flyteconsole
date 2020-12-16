import { DeepPartial } from 'common/types';
import { dateToTimestamp, millisecondsToDuration } from 'common/utils';
import { Admin, Core } from 'flyteidl';
import { merge } from 'lodash';
import { timeStampOffset } from 'mocks/utils';
import {
    CompiledTask,
    endNodeId,
    Execution,
    LaunchPlan,
    NodeExecution,
    startNodeId,
    Task,
    TaskExecution,
    Workflow
} from 'models';
import { Identifier, ResourceType } from 'models/Common/types';
import {
    NodeExecutionPhase,
    TaskExecutionPhase,
    WorkflowExecutionPhase
} from 'models/Execution/enums';
import {
    defaultExecutionDuration,
    emptyInputUri,
    emptyOutputUri,
    entityCreationDate,
    mockStartDate,
    testDomain,
    testProject,
    testVersions
} from './constants';
import { nodeExecutionId, sampleLogs, taskExecutionId } from './utils';

export function taskFromCompiledTask(compiledTask: CompiledTask): Task {
    return {
        closure: { createdAt: { ...entityCreationDate }, compiledTask },
        id: compiledTask.template.id
    };
}

export function generateTask(
    idOverrides: Partial<Identifier>,
    compiledTaskOverrides?: DeepPartial<CompiledTask>
): Task {
    const id = {
        resourceType: ResourceType.TASK,
        project: testProject,
        domain: testDomain,
        name: '_base',
        version: testVersions.v1,
        ...idOverrides
    };
    const base: CompiledTask = {
        template: {
            custom: {},
            container: {},
            metadata: {},
            type: 'unknown-type',
            id,
            interface: {
                inputs: {
                    variables: {}
                },
                outputs: {
                    variables: {}
                }
            }
        }
    };
    return taskFromCompiledTask(merge(base, compiledTaskOverrides));
}

export function generateWorkflow(
    idOverrides: Partial<Identifier>,
    overrides: DeepPartial<Workflow>
): Workflow {
    const id = {
        resourceType: Core.ResourceType.WORKFLOW,
        project: testProject,
        domain: testDomain,
        name: '_base',
        version: testVersions.v1,
        ...idOverrides
    };
    const base: Workflow = {
        id,
        closure: {
            createdAt: { ...entityCreationDate },
            compiledWorkflow: {
                primary: {
                    connections: {
                        downstream: {},
                        upstream: {}
                    },
                    template: {
                        metadata: {},
                        metadataDefaults: {},
                        id,
                        interface: {},
                        nodes: [{ id: startNodeId }, { id: endNodeId }],
                        outputs: []
                    }
                },
                tasks: []
            }
        }
    };
    return merge(base, overrides);
}

export function generateExecutionForWorkflow(
    workflow: Workflow,
    launchPlan: LaunchPlan,
    overrides?: DeepPartial<Execution>
): Execution {
    const executionStart = dateToTimestamp(mockStartDate);
    const { id: workflowId } = workflow;
    const id = {
        project: testProject,
        domain: testDomain,
        name: `${workflowId.name}Execution`
    };
    const base: Execution = {
        id,
        spec: {
            launchPlan: { ...launchPlan.id },
            inputs: { literals: {} },
            metadata: {
                mode: Admin.ExecutionMetadata.ExecutionMode.MANUAL,
                principal: 'sdk',
                nesting: 0
            },
            notifications: {
                notifications: []
            }
        },
        closure: {
            workflowId,
            computedInputs: { literals: {} },
            createdAt: executionStart,
            duration: millisecondsToDuration(defaultExecutionDuration),
            phase: WorkflowExecutionPhase.SUCCEEDED,
            startedAt: executionStart
        }
    };
    return merge(base, overrides);
}

export function generateNodeExecution(
    parentExecution: Execution,
    nodeId: string,
    overrides?: DeepPartial<NodeExecution>
): NodeExecution {
    const base: NodeExecution = {
        id: nodeExecutionId(parentExecution.id, nodeId),
        metadata: { specNodeId: nodeId },
        closure: {
            createdAt: timeStampOffset(parentExecution.closure.createdAt, 0),
            startedAt: timeStampOffset(parentExecution.closure.createdAt, 0),
            outputUri: emptyOutputUri,
            phase: NodeExecutionPhase.SUCCEEDED,
            duration: millisecondsToDuration(defaultExecutionDuration)
        },
        inputUri: emptyInputUri
    };
    return merge(base, overrides);
}

export function generateTaskExecution(
    nodeExecution: NodeExecution,
    task: Task,
    overrides?: DeepPartial<TaskExecution>
): TaskExecution {
    const base: TaskExecution = {
        id: taskExecutionId(nodeExecution, task, 0),
        inputUri: emptyInputUri,
        isParent: false,
        closure: {
            customInfo: {},
            phase: TaskExecutionPhase.SUCCEEDED,
            duration: millisecondsToDuration(defaultExecutionDuration),
            createdAt: timeStampOffset(nodeExecution.closure.createdAt, 0),
            startedAt: timeStampOffset(nodeExecution.closure.createdAt, 0),
            outputUri: emptyOutputUri,
            logs: sampleLogs()
        }
    };
    return merge(base, overrides);
}
