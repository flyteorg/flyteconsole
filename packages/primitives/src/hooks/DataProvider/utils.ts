import moment from 'moment';
import { IntervalFilterType } from '../../types/cloudTypes';

export const generateTimestampsForRange = (range?: IntervalFilterType) => {
  if (!range) {
    return {};
  }
  let end = moment().utc();
  let start = moment().utc();

  switch (range) {
    case IntervalFilterType.Yearly:
      start.subtract(1, 'year');
      break;
    case IntervalFilterType.Monthly:
      start.subtract(1, 'month');
      break;
    case IntervalFilterType.Weekly:
    case IntervalFilterType.Last7Days:
      start.subtract(7, 'day');
      break;
    case IntervalFilterType.Last14Days:
      start.subtract(14, 'day');
      break;
    case IntervalFilterType.Last60Days:
      start.subtract(60, 'day');
      break;
    case IntervalFilterType.MonthToDate:
      start = start.startOf('month');
      break;
    case IntervalFilterType.LastMonth:
      start = start.subtract(1, 'month').startOf('month');
      end = end.subtract(1, 'month').endOf('month');
      break;
    case IntervalFilterType.Hourly:
    default:
      start.subtract(24, 'hour');
      break;
  }

  return {
    startTimeUTC: start.utc(),
    endTimeUTC: end.utc(),
  };
};
