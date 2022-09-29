import { createLocalizedString } from '@flyteconsole/locale';

const str = {
  durationLabel: 'duration',
  inputsAndOutputsTooltip: 'View Inputs & Outpus',
  nameLabel: 'task name',
  nodeIdLabel: 'node id',
  phaseLabel: 'status',
  queuedTimeLabel: 'Queued Time',
  rerunTooltip: 'Rerun',
  resumeTooltip: 'Resume',
  startedAtLabel: 'start time',
  typeLabel: 'type',
};

export { patternKey } from '@flyteconsole/locale';
export default createLocalizedString(str);
