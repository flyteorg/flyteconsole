import { DeepPartial } from 'common/types';
import { Core } from 'flyteidl';
import { cloneDeep, merge } from 'lodash';
import { endNodeId, Identifier, startNodeId } from 'models';
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
import { taskNodeIds, bindingFromNode } from './utils';

const baseId = {
    resourceType: Core.ResourceType.WORKFLOW,
    project: testProject,
    domain: testDomain,
    name: '_base',
    version: testVersions.v1
};
const baseWorkflowTemplate: Workflow = {
    id: { ...baseId },
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
                    id: { ...baseId },
                    interface: {},
                    nodes: [{ id: startNodeId }, { id: endNodeId }],
                    outputs: []
                }
            },
            tasks: []
        }
    }
};

export function generateWorkflow(id: Partial<Identifier>, overrides: DeepPartial<Workflow>): Workflow {
    const idMask = { id, closure: { compiledWorkflow: { primary: { template: { id }}}} };
    return merge(cloneDeep(baseWorkflowTemplate), idMask, overrides);
}

/** This workflow has a single python node which takes a string as input
 * and copies it to the output.
 */
const basic = generateWorkflow({ name: 'Basic'}, {
    closure: {
        compiledWorkflow: {
            primary: {
                connections: {
                    downstream: {
                        [startNodeId]: { ids: [nodeIds.pythonTask] },
                        [nodeIds.pythonTask]: { ids: [endNodeId] }
                    },
                    upstream: {
                        [nodeIds.pythonTask]: { ids: [startNodeId] },
                        [endNodeId]: { ids: [nodeIds.pythonTask] }
                    }
                },
                template: {
                    // This workflow has just one task, so the i/o will be those from
                    // the task
                    interface: cloneDeep(
                        tasks.basicPython.closure.compiledTask.template
                            .interface
                    ),
                    nodes: [
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
            tasks: [tasks.basicPython.closure.compiledTask]
        }
    }
});

/** This workflow has two top-level nodes:
 * - A basic python task
 * - A dynamic task which will produce an additional python task at runtime.
 */
const nestedDynamic = generateWorkflow({name: 'NestedDynamic'}, {
    closure: {
        compiledWorkflow: {
            primary: {
                connections: {
                    downstream: {
                        [startNodeId]: {
                            ids: [nodeIds.dynamicTask, nodeIds.pythonTask]
                        },
                        [nodeIds.pythonTask]: { ids: [endNodeId] },
                        [nodeIds.dynamicTask]: { ids: [endNodeId] }
                    },
                    upstream: {
                        [nodeIds.dynamicTask]: { ids: [startNodeId] },
                        [nodeIds.pythonTask]: { ids: [startNodeId] },
                        [endNodeId]: {
                            ids: [nodeIds.dynamicTask, nodeIds.pythonTask]
                        }
                    }
                },
                template: {
                    // This workflow uses the same i/o as its nested dynamic task
                    interface: cloneDeep(
                        tasks.dynamic.closure.compiledTask.template.interface
                    ),
                    nodes: [
                        {
                            ...taskNodeIds(nodeIds.pythonTask, tasks.basicPython),
                            inputs: [
                                bindingFromNode(
                                    variableNames.basicString,
                                    startNodeId,
                                    variableNames.basicString
                                )
                            ]
                        },
                        {
                            ...taskNodeIds(
                                nodeIds.dynamicTask,
                                tasks.dynamic
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
                            nodeIds.dynamicTask,
                            variableNames.basicString
                        )
                    ]
                }
            },
            tasks: [
                cloneDeep(tasks.dynamic.closure.compiledTask),
                cloneDeep(tasks.basicPython.closure.compiledTask)
            ]
        }
    }
})

export const workflows = {
    basic,
    nestedDynamic
};
