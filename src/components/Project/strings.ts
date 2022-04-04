import { createLocalizedString } from 'basics/Locale';

const str = {
  executionsTotal: (n: number) => `${n} Executions`,
  tasksTotal: (n: number) => `${n} Tasks`,
};

export { patternKey } from 'basics/Locale';
export default createLocalizedString(str);
