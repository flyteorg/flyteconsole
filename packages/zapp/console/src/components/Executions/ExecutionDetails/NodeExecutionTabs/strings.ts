import { createLocalizedString } from 'basics/Locale';

const str = {
  attempt: (n: number) => `Attempt ${n}`,
  logs: 'Logs',
};

export { patternKey } from 'basics/Locale';
export default createLocalizedString(str);
