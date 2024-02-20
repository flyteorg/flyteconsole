import { createLocalizedString } from '@clients/locale/locale';

const str = {
  pausedTasksButton: 'Paused Tasks',
  legendButton: (isVisible: boolean) => `${isVisible ? 'Hide' : 'Show'} Legend`,
  resumeTooltip: 'Resume',
};

export default createLocalizedString(str);
