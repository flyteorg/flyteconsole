import { createLocalizedString } from '@flyteorg/locale';

const str = {
  allExecutionsTitle: 'All Executions in the Project',
  last100ExecutionsTitle: 'Last 100 Executions in the Project',
  tasksTotal: (n: number) => `${n} Tasks`,
  workflowsTotal: (n: number) => `${n} Workflows`,
};

export { patternKey } from '@flyteorg/locale';
export default createLocalizedString(str);
