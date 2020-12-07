import { Core } from 'flyteidl';
import { cloneDeep } from 'lodash';
import { Binding, CompiledTask, endNodeId, startNodeId } from 'models';
import { Workflow } from 'models/Workflow/types';
import {
    entityCreationDate,
    nodeIds,
    testDomain,
    testProject,
    testVersions,
    variableNames
} from './constants';
import { tasks } from './tasks';

function taskNodeIds(id: string, task: CompiledTask) {
    return {
        id,
        taskNode: { referenceId: { ...task.template.id } }
    };
}

function bindingFromNode(
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

const basicId = {
    resourceType: Core.ResourceType.WORKFLOW,
    project: testProject,
    domain: testDomain,
    name: 'Basic',
    version: testVersions.v1
};
const basic: Workflow = {
    id: { ...basicId },
    closure: {
        createdAt: { ...entityCreationDate },
        compiledWorkflow: {
            primary: {
                connections: {
                    downstream: {
                        [startNodeId]: { ids: [nodeIds.pythonTask] },
                        pythonTask: { ids: [endNodeId] }
                    },
                    upstream: {
                        pythonTask: { ids: [startNodeId] },
                        [endNodeId]: { ids: [nodeIds.pythonTask] }
                    }
                },
                template: {
                    metadata: {},
                    metadataDefaults: {},
                    id: { ...basicId },
                    // This workflow has just one task, so the i/o will be those from
                    // the task
                    interface: cloneDeep(tasks.basicPython.template.interface),
                    nodes: [
                        { id: startNodeId },
                        { id: endNodeId },
                        {
                            ...taskNodeIds(
                                nodeIds.pythonTask,
                                tasks.basicPython
                            ),
                            inputs: [
                                bindingFromNode(
                                    variableNames.basicString,
                                    startNodeId,
                                    variableNames.basicString
                                )
                            ]
                        }
                    ],
                    outputs: [
                        bindingFromNode(
                            variableNames.basicString,
                            nodeIds.pythonTask,
                            variableNames.basicString
                        )
                    ]
                }
            },
            tasks: [cloneDeep(tasks.basicPython)]
        }
    }
};

export const workflows = { basic };
