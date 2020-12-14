import { cloneDeep } from 'lodash';
import {
    endNodeId,
    Identifier,
    ResourceType,
    startNodeId,
    TaskExecution,
    Workflow
} from 'models';
import {
    entityCreationDate,
    testDomain,
    testProject,
    testVersions
} from '../constants';
import { launchPlans } from '../launchPlans';
import { nodeExecution, nodeExecutions } from '../nodeExecutions';
import {
    taskExecutionForNodeExecution,
    taskExecutions
} from '../taskExecutions';
import { tasks } from '../tasks';
import { makeDefaultLaunchPlan, taskNodeIds } from '../utils';
import { workflowExecution } from '../workflowExecutions';
import { workflows } from '../workflows';
import { MockDataFixture } from './types';

const topWorkflowId: Identifier = {
    resourceType: ResourceType.WORKFLOW,
    project: testProject,
    domain: testDomain,
    name: 'ExternalSubWorkflow',
    version: testVersions.v1
};

const nodeIds = {
    subWorkflow: 'subWorkflowNode'
};

// TODO: utility function to generate all of the default stuff and allow overrides for connections, nodes, tasks
const topWorkflow: Workflow = {
    id: { ...topWorkflowId },
    closure: {
        createdAt: { ...entityCreationDate },
        compiledWorkflow: {
            primary: {
                connections: {
                    downstream: {
                        [startNodeId]: { ids: [nodeIds.subWorkflow] },
                        [nodeIds.subWorkflow]: { ids: [endNodeId] }
                    },
                    upstream: {
                        [nodeIds.subWorkflow]: { ids: [startNodeId] },
                        [endNodeId]: { ids: [nodeIds.subWorkflow] }
                    }
                },
                template: {
                    metadata: {},
                    metadataDefaults: {},
                    id: { ...topWorkflowId },
                    interface: {},
                    nodes: [
                        { id: startNodeId },
                        { id: endNodeId },
                        {
                            ...taskNodeIds(
                                nodeIds.subWorkflow,
                                tasks.dynamicNoInputs
                            ),
                            inputs: []
                        }
                    ],
                    outputs: []
                }
            },
            tasks: [cloneDeep(tasks.dynamicNoInputs.closure.compiledTask)]
        }
    }
};
const topWorkflowLaunchPlan = makeDefaultLaunchPlan(topWorkflow);

const topExecution = workflowExecution(
    {
        project: testProject,
        domain: testDomain,
        name: `${topWorkflowId.name}Execution`
    },
    topWorkflow.id,
    topWorkflowLaunchPlan
);

const topNodeExecution = nodeExecution(topExecution, 'dynamicWorkflowChild', {
    metadata: {
        specNodeId: nodeIds.subWorkflow
    }
});

const topTaskExecution: TaskExecution = {
    ...taskExecutionForNodeExecution(topNodeExecution, tasks.dynamicNoInputs),
    isParent: true
};

const subWorkflowExecution = workflowExecution(
    {
        project: testProject,
        domain: testDomain,
        name: `${workflows.basic.id}NestedExecution`
    },
    workflows.basic.id,
    launchPlans.basic
);

const subWorkflowNodeExecution = nodeExecution(
    topExecution,
    'subWorkflowNode',
    {
        closure: {
            workflowNodeMetadata: {
                executionId: subWorkflowExecution.id
            }
        }
    }
);

/**
 * A workflow with one dynamic task node which will yield an additional node at
 * runtime. The child node will launch a separate workflow execution referencing
 * our basic python workflow.
 */
export const dynamicExternalSubWorkflow = {
    generate(): MockDataFixture {
        return {
            launchPlans: [cloneDeep(topWorkflowLaunchPlan)],
            tasks: [],
            workflows: [cloneDeep(topWorkflow)],
            workflowExecutions: [
                {
                    data: cloneDeep(topExecution),
                    nodeExecutions: [
                        {
                            data: cloneDeep(topNodeExecution),
                            taskExecutions: [
                                {
                                    data: cloneDeep(topTaskExecution),
                                    nodeExecutions: [
                                        {
                                            data: cloneDeep(
                                                subWorkflowNodeExecution
                                            )
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    data: subWorkflowExecution,
                    nodeExecutions: [
                        {
                            data: nodeExecutions.pythonNode,
                            taskExecutions: [
                                { data: taskExecutions.pythonNode }
                            ]
                        }
                    ]
                }
            ]
        };
    }
};
