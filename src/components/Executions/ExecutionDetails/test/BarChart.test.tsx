import { formatSecondsToHmsFormat } from '../Timeline/BarChart/utils';

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
});
