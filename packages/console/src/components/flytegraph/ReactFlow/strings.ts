import { createLocalizedString } from '@flyteorg/locale';

const str = {
  pausedTasksButton: 'Paused Tasks',
  legendButton: (isVisible: boolean) => `${isVisible ? 'Hide' : 'Show'} Legend`,
  resumeTooltip: 'Resume',
};

export { patternKey } from '@flyteorg/locale';
export default createLocalizedString(str);
