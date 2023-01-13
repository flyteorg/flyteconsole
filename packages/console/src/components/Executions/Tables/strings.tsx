import { createLocalizedString } from '@flyteorg/locale';

const str = {
  durationLabel: 'duration',
  inputsAndOutputsTooltip: 'View Inputs & Outputs',
  nameLabel: 'task name',
  nodeIdLabel: 'node id',
  phaseLabel: 'status',
  queuedTimeLabel: 'queued time',
  rerunTooltip: 'Rerun',
  resumeTooltip: 'Resume',
  startedAtLabel: 'start time',
  typeLabel: 'type',
  loadMoreButton: 'Load More',
  expanderTitle: (expanded: boolean) =>
    expanded ? 'Collapse row' : 'Expand row',
};

export { patternKey } from '@flyteorg/locale';
export default createLocalizedString(str);
