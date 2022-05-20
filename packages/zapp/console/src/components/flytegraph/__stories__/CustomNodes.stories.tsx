import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import { CacheContext } from 'components/Cache/CacheContext';
import { createCache } from 'components/Cache/createCache';
import { NodeExecutionDisplayType } from 'components/Executions/types';
import { NodeExecutionPhase } from 'models/Execution/enums';
import { TaskType } from 'models/Task/constants';
import * as React from 'react';
import { ReactFlowCustomTaskNode } from '../ReactFlow/customNodeComponents';

const cache = createCache();

const stories = storiesOf('CustomNodes', module);
stories.addDecorator((story) => (
  <>
    <CacheContext.Provider value={cache}>{story()}</CacheContext.Provider>
  </>
));

const commonData = {
  onNodeSelectionChanged: action('nodeSelected'),
  onPhaseSelectionChanged: action('phaseSelected'),
  scopedId: 'n0',
};

const taskData = {
  ...commonData,
  nodeType: NodeExecutionDisplayType.PythonTask,
  nodeExecutionStatus: NodeExecutionPhase.SUCCEEDED,
  taskType: TaskType.PYTHON,
  text: 'pythonTask',
  cacheStatus: 0,
};

stories.add('Task Node', () => <ReactFlowCustomTaskNode data={taskData} />);

const logsByPhase = new Map();
logsByPhase.set(5, [
  {
    uri: '#',
    name: 'Kubernetes Logs #0-0-1',
    messageFormat: 2,
  },
  {
    uri: '#',
    name: 'Kubernetes Logs #0-1',
    messageFormat: 2,
  },
]);
logsByPhase.set(2, [
  {
    uri: '#',
    name: 'Kubernetes Logs #0-2-1',
    messageFormat: 2,
  },
]);
logsByPhase.set(6, [
  {
    name: 'ff21a6480a4c84742ad4-n0-0-3',
  },
]);

const mapTaskData = {
  ...commonData,
  nodeType: NodeExecutionDisplayType.MapTask,
  nodeExecutionStatus: NodeExecutionPhase.SUCCEEDED,
  taskType: TaskType.ARRAY,
  text: 'mapTask',
  cacheStatus: 0,
  selectedPhase: undefined,
  logsByPhase: logsByPhase,
};

stories.add('Map Task Node', () => <ReactFlowCustomTaskNode data={mapTaskData} />);
