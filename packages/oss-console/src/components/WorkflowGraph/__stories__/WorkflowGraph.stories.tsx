import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import { CacheContext } from '../../Cache/CacheContext';
import { createCache } from '../../Cache/createCache';
import { DetailsPanel } from '../../common/DetailsPanel';
import { extractTaskTemplates } from '../../hooks/utils';
import { CompiledWorkflowClosure, Workflow } from '../../../models/Workflow/types';
import { WorkflowGraph } from '../WorkflowGraph';
import graphData from './rich.json';

const graphDataClosure = graphData as unknown as CompiledWorkflowClosure;
const shortDescription = '';

const workflow: Workflow = {
  closure: { compiledWorkflow: graphDataClosure },
  id: {
    project: 'test',
    domain: 'test',
    name: 'test',
    version: '1',
  },
  shortDescription,
};

const onNodeSelectionChanged = action('nodeSelected');
const onPhaseSelectionChanged = action('phaseSelected');

const cache = createCache();
const taskTemplates = extractTaskTemplates(workflow);
cache.mergeArray(taskTemplates);

const stories = storiesOf('WorkflowGraph', module);
stories.addDecorator((story) => (
  <>
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: '35vw',
        left: 0,
        bottom: 0,
        height: '450px',
      }}
    >
      <CacheContext.Provider value={cache}>{story()}</CacheContext.Provider>
    </div>
    <DetailsPanel />
  </>
));

stories.add('TaskNodeRenderer', () => (
  <WorkflowGraph
    onNodeSelectionChanged={onNodeSelectionChanged}
    onPhaseSelectionChanged={onPhaseSelectionChanged}
    workflow={workflow}
    isDetailsTabClosed
  />
));
