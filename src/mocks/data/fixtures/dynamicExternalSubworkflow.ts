import { cloneDeep } from 'lodash';
import { endNodeId, startNodeId, TaskExecution } from 'models';
import { testDomain, testProject } from '../constants';
import { nodeExecution } from '../nodeExecutions';
import { taskExecutionForNodeExecution } from '../taskExecutions';
import { generateTask } from '../tasks';
import { makeDefaultLaunchPlan, taskNodeIds } from '../utils';
import { workflowExecution } from '../workflowExecutions';
import { generateWorkflow } from '../workflows';

const topWorkflowName = 'LaunchExternalSubWorkflow';
const nodeIds = {
    subWorkflow: 'subWorkflowNode',
    python: 'pythonNode'
};

const subWorkflowTaskName = `${topWorkflowName}.LaunchSubworkflowTask`;
const launchSubWorkflowTask = generateTask(
    { name: subWorkflowTaskName },
    { template: { type: 'dynamic-task' } }
);
const topWorkflow = generateWorkflow(
    { name: topWorkflowName },
    {
        closure: {
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
                        nodes: [
                            {
                                ...taskNodeIds(
                                    nodeIds.subWorkflow,
                                    launchSubWorkflowTask
                                ),
                                inputs: []
                            }
                        ]
                    }
                },
                tasks: [cloneDeep(launchSubWorkflowTask.closure.compiledTask)]
            }
        }
    }
);

const topWorkflowLaunchPlan = makeDefaultLaunchPlan(topWorkflow);
const topExecution = workflowExecution(
    {
        project: testProject,
        domain: testDomain,
        name: `${topWorkflowName}Execution`
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
    ...taskExecutionForNodeExecution(topNodeExecution, launchSubWorkflowTask),
    isParent: true
};

const subWorkflowPythonTask = generateTask(
    { name: `${topWorkflowName}.PythonTask` },
    { template: { type: 'python-task' } }
);

const subWorkflowName = `${topWorkflowName}.SubWorkflow`;
const subWorkflow = generateWorkflow(
    { name: subWorkflowName },
    {
        closure: {
            compiledWorkflow: {
                primary: {
                    connections: {
                        downstream: {
                            [startNodeId]: { ids: [nodeIds.python] },
                            [nodeIds.python]: { ids: [endNodeId] }
                        },
                        upstream: {
                            [nodeIds.python]: { ids: [startNodeId] },
                            [endNodeId]: { ids: [nodeIds.python] }
                        }
                    },
                    template: {
                        nodes: [
                            {
                                ...taskNodeIds(
                                    nodeIds.python,
                                    subWorkflowPythonTask
                                ),
                                inputs: []
                            }
                        ]
                    }
                },
                tasks: [subWorkflowPythonTask.closure.compiledTask]
            }
        }
    }
);
const subWorkflowLaunchPlan = makeDefaultLaunchPlan(subWorkflow);

const subWorkflowExecution = workflowExecution(
    {
        project: testProject,
        domain: testDomain,
        name: `${subWorkflowName}Execution`
    },
    subWorkflow.id,
    subWorkflowLaunchPlan
);
const pythonNodeExecution = nodeExecution(subWorkflowExecution, 'pythonNode', {
    metadata: {
        specNodeId: nodeIds.python
    }
});
const pythonTaskExecution: TaskExecution = {
    ...taskExecutionForNodeExecution(pythonNodeExecution, subWorkflowPythonTask)
};

const launchSubWorkflowNodeExecution = nodeExecution(
    topExecution,
    'launchSubWorkflow',
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
    generate() {
        return {
            launchPlans: {
                top: cloneDeep(topWorkflowLaunchPlan),
                subWorkflow: cloneDeep(subWorkflowLaunchPlan)
            },
            tasks: {
                generateSubWorkflow: cloneDeep(launchSubWorkflowTask),
                pythonTask: cloneDeep(subWorkflowPythonTask)
            },
            workflows: {
                top: cloneDeep(topWorkflow),
                sub: cloneDeep(subWorkflow)
            },
            workflowExecutions: {
                top: {
                    data: cloneDeep(topExecution),
                    nodeExecutions: {
                        dynamicWorkflowGenerator: {
                            data: cloneDeep(topNodeExecution),
                            taskExecutions: {
                                firstAttempt: {
                                    data: cloneDeep(topTaskExecution),
                                    nodeExecutions: {
                                        launchSubWorkflow: {
                                            data: cloneDeep(
                                                launchSubWorkflowNodeExecution
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                sub: {
                    data: cloneDeep(subWorkflowExecution),
                    nodeExecutions: {
                        pythonNode: {
                            data: cloneDeep(pythonNodeExecution),
                            taskExecutions: {
                                firstAttempt: { data: pythonTaskExecution }
                            }
                        }
                    }
                }
            }
        };
    }
};
