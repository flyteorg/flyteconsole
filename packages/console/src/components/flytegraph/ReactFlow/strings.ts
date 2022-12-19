import { createLocalizedString } from '@flyteoss/locale';

const str = {
  pausedTasksButton: 'Paused Tasks',
  legendButton: (isVisible: boolean) => `${isVisible ? 'Hide' : 'Show'} Legend`,
  resumeTooltip: 'Resume',
};

export { patternKey } from '@flyteoss/locale';
export default createLocalizedString(str);
