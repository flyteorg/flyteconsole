import { Moment } from 'moment';
import { IntervalFilterType } from '../types/cloudTypes';

export const removeISOMilliseconds = (dateString: string) => {
  return dateString.replace(/.\d+Z$/g, 'Z');
};

export const removeIntervalSeconds = (intervalString: string) => {
  return intervalString.replace(/s/g, '');
};

export type DateFormat = 'M/D' | 'M/D/YYYY';

export const formatInterval = (start: Moment, end: Moment, range: string) => {
  let dateFormat: DateFormat = 'M/D';
  switch (range) {
    case IntervalFilterType.Yearly:
      dateFormat = 'M/D/YYYY';
      break;
    case IntervalFilterType.Monthly:
    case IntervalFilterType.Weekly:
    case IntervalFilterType.Hourly:
    default:
      break;
  }

  if (start && end) {
    return `(${start.format(dateFormat)} - ${end.format(dateFormat)}) `;
  }

  return '';
};
