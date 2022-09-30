import {
  CASHED_GREEN,
  formatSecondsToHmsFormat,
  generateChartData,
  TRANSPARENT,
} from '../Timeline/TimelineChart/utils';
import { mockbarItems } from './__mocks__/NodeExecution.mock';

describe('ExecutionDetails > Timeline > BarChart', () => {
  it('formatSecondsToHmsFormat works as expected', () => {
    // more than hour
    expect(formatSecondsToHmsFormat(4231)).toEqual('1h 10m 31s');
    expect(formatSecondsToHmsFormat(3601)).toEqual('1h 0m 1s');
    // 1 hour
    expect(formatSecondsToHmsFormat(3600)).toEqual('1h 0m 0s');

    // less than 1 hour and more than 1 minute
    expect(formatSecondsToHmsFormat(3599)).toEqual('59m 59s');
    expect(formatSecondsToHmsFormat(600)).toEqual('10m 0s');
    expect(formatSecondsToHmsFormat(61)).toEqual('1m 1s');
    // 1 minute
    expect(formatSecondsToHmsFormat(60)).toEqual('1m 0s');
    // less than minute
    expect(formatSecondsToHmsFormat(59)).toEqual('59s');
    expect(formatSecondsToHmsFormat(23)).toEqual('23s');
    expect(formatSecondsToHmsFormat(0)).toEqual('0s');
  });

  it('generateChartData properly generates map of data for ChartBars', () => {
    const chartData = generateChartData(mockbarItems);
    expect(chartData.durations).toEqual([15, 11, 23, 0, 11]);
    expect(chartData.startOffset).toEqual([0, 5, 17, 39, 5]);
    expect(chartData.offsetColor).toEqual([
      TRANSPARENT,
      CASHED_GREEN,
      TRANSPARENT,
      TRANSPARENT,
      TRANSPARENT,
    ]);
    // labels looks as expected
    expect(chartData.barLabel[0]).toEqual(formatSecondsToHmsFormat(mockbarItems[0].durationSec));
    expect(chartData.barLabel[1]).toEqual('\u229A From cache');
    expect(chartData.barLabel[3]).toEqual('');
    expect(chartData.barLabel[4]).toEqual(
      "\u229A Check the detail panel for each task's cache status.",
    );
  });
});
