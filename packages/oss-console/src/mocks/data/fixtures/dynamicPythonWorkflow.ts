import { endNodeId, startNodeId } from '../../../models/Node/constants';
import { nodeIds } from '../constants';
import { generateExecutionForWorkflow, generateTask, generateWorkflow } from '../generators';
import { makeDefaultLaunchPlan, taskNodeIds } from '../utils';

const workflowName = 'DynamicPythonTaskWorkflow';
const pythonTaskName = `${workflowName}.PythonTask`;
const pythonNodeId = 'pythonNode';
const dynamicTaskName = `${workflowName}.DynamicTask`;
const dynamicNodeId = 'dynamicNode';

function getSharedEntities() {
  const pythonTask = generateTask(
    { name: pythonTaskName },
    {
      template: {
        type: 'python-task',
      },
    },
  );

  const dynamicTask = generateTask(
    { name: dynamicTaskName },
    {
      template: {
        type: 'dynamic-task',
      },
    },
  );

  const workflow = generateWorkflow(
    { name: workflowName },
    {
      closure: {
        compiledWorkflow: {
          primary: {
            connections: {
              downstream: {
                [startNodeId]: {
                  ids: [dynamicNodeId],
                },
                [nodeIds.dynamicTask]: { ids: [endNodeId] },
              },
              upstream: {
                [nodeIds.dynamicTask]: { ids: [startNodeId] },
                [endNodeId]: {
                  ids: [nodeIds.dynamicTask],
                },
              },
            },
            template: {
              nodes: [
                {
                  ...taskNodeIds(dynamicNodeId, dynamicTask),
                  inputs: [],
                },
              ],
              outputs: [],
            },
          },
          tasks: [dynamicTask.closure.compiledTask, pythonTask.closure.compiledTask],
        },
      },
    },
  );

  const launchPlan = makeDefaultLaunchPlan(workflow);
  const execution = generateExecutionForWorkflow(workflow, launchPlan);
  return { pythonTask, dynamicTask, workflow, launchPlan, execution };
}
