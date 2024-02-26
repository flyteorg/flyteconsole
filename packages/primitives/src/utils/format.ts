import { IntervalFilterType } from '../types/cloudTypes';

const THOUSAND = 1000;
const MILLION = 1000 * THOUSAND;

// TODO #42: narusina - move info similar to flyteconsole, to allow debug logs in dev, but not in prod and test
const isTestEnv = () => process.env.NODE_ENV === 'test';
const logError = (message?: any, ...optionalParams: any[]) => {
  if (!isTestEnv()) {
    // eslint-disable-next-line no-console
    console.error(message, ...optionalParams);
  }
};

/** Because attempts are often 0 this util helps handle the 'truthy/falsy' check */
export const checkIsNumber = (attemptValue: any): boolean => {
  return (
    attemptValue !== '' &&
    attemptValue !== undefined &&
    attemptValue !== null &&
    !Number.isNaN(attemptValue)
  );
};

// Values under 1,000 are displayed as-is with proper comma (eg, 1432 = 1,432).
// Values over 1,000 are displayed with "k" (eg, 1.5k)
// Values over 1,000 round to nearest-tenth decimal (1,432 = 1.4k)
// Ensure that value progresses as 0 -> 100 -> 1.5k -> 11k
// (for anything that bigger than 10k drop the decimal point) -> 100k -> 1.3M -> 11M -> 100M -> >999M
// (if we can't feet 4 symbols, that >99M - should be last value)
export const numericFormat = (input: number): string => {
  // 99.1M -> >99M
  if (input / MILLION > 99) {
    return '>99M';
  }

  // 99M   -> 99M
  // 89.9M -> 90M
  // 96.6M -> 97M
  // 10M   -> 10M
  if (input / MILLION >= 10) {
    return `${Math.round(input / MILLION)}M`;
  }

  // 9.95M -> 10M
  // 9.94M -> 9.9M
  // 9.46M -> 9.5M
  // 999.5K  -> 1M
  if (parseFloat((input / MILLION).toFixed(3)) >= 1) {
    return `${parseFloat((input / MILLION).toFixed(1))}M`;
  }

  // 999.4K  -> 999K
  // 10.1K -> 10k
  // 10K   -> 10K
  if (input / THOUSAND >= 10) {
    return `${Math.round(input / THOUSAND)}K`;
  }

  // 9.95K -> 10K
  // 9.94K -> 9.9K
  // 1K -> 1K
  // 999.95 -> 1k
  if (parseFloat((input / THOUSAND).toFixed(4)) >= 1) {
    return `${parseFloat((input / THOUSAND).toFixed(1))}K`;
  }

  // 999.96 -> 999.9
  // 1.03  -> 1
  if (input >= 1) {
    return `${parseFloat(input.toFixed(1))}`;
  }

  // -2 -> 0
  if (input < 0) {
    return '0';
  }

  // 0.996 -> 1
  // 0.996 -> 0.99
  return `${parseFloat(input.toFixed(2))}`;
};

export const calculatePercentageValue = (value: number, total: number): number => {
  if (value === 0 && total === 0) {
    return 0;
  }

  if (value < 0) {
    logError('Value should equal or greater than 0');
    return 0;
  }

  if (total <= 0) {
    logError('Total should be positive');
    return 0;
  }

  if (value > total) {
    logError('Value should be less or equal than total');
    return 100;
  }

  return (value * 100.0) / total;
};

const pad = (n: number): string => {
  return n < 10 ? `0${n}` : `${n}`;
};

export const toDateLabelFromRange = (
  d: Date,
  intervalType: IntervalFilterType,
): string | string[] => {
  const month = pad(d.getUTCMonth() + 1);
  const date = pad(d.getUTCDate());
  const hour = pad(d.getUTCHours());
  const minute = pad(d.getUTCMinutes());
  switch (intervalType) {
    case IntervalFilterType.Hourly:
      return `${hour}:${minute}`;
    case IntervalFilterType.Weekly:
      return [`${hour}:${minute}`, `${month}/${date}`];
    case IntervalFilterType.Monthly:
    case IntervalFilterType.Yearly:
      return `${month}/${date}`;
    default:
      break;
  }
  return `${month}/${date}`;
};
