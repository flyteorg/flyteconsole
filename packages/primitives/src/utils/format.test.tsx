import { calculatePercentageValue, numericFormat } from './format';

const testCasesNumericFormat = [
  { value: -10, expected: '0' },
  { value: 0.123, expected: '0.12' },
  { value: 10, expected: '10' },
  { value: 10.1, expected: '10.1' },
  { value: 10.12, expected: '10.1' },
  { value: 100, expected: '100' },
  { value: 100.15, expected: '100.2' },
  { value: 999.94, expected: '999.9' },
  { value: 999.95, expected: '1K' },
  { value: 1000, expected: '1K' },
  { value: 1400, expected: '1.4K' },
  { value: 9950, expected: '9.9K' },
  { value: 9960, expected: '10K' },
  { value: 10000, expected: '10K' },
  { value: 99000, expected: '99K' },
  { value: 99500, expected: '100K' },
  { value: 100000, expected: '100K' },
  { value: 999000, expected: '999K' },
  { value: 999400, expected: '999K' },
  { value: 999500, expected: '1M' },
  { value: 1000000, expected: '1M' },
  { value: 1200000, expected: '1.2M' },
  { value: 9940000, expected: '9.9M' },
  { value: 9951000, expected: '10M' },
  { value: 10000000, expected: '10M' },
  { value: 99000000, expected: '99M' },
  { value: 99000001, expected: '>99M' },
];

const testCasesCalculatePercentageValue = [
  { value: 10, total: 100, expected: 10 },
  { value: 0, total: 100, expected: 0 },
  { value: -10, total: 100, expected: 0 },
  { value: 10, total: -100, expected: 0 },
  { value: 10, total: 0, expected: 0 },
  { value: 110, total: 100, expected: 100 },
  { value: 23.2, total: 100, expected: 23.2 },
];

describe('Format', () => {
  it('check numericFormat', () => {
    testCasesNumericFormat.forEach((testCase) => {
      expect(numericFormat(testCase.value)).toBe(testCase.expected);
    });
  });

  it('check calculatePercentageValue', () => {
    testCasesCalculatePercentageValue.forEach((testCase) => {
      expect(calculatePercentageValue(testCase.value, testCase.total)).toBe(testCase.expected);
    });
  });
});
