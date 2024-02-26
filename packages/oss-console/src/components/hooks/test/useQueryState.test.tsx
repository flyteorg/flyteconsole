import { renderHook, act } from '@testing-library/react-hooks';
import { parseQueryParams, stringifyQueryParams, useQueryState } from '../useQueryState';

const mockHistoryPush = jest.fn();

jest.mock('react-router', () => ({
  useLocation: () => ({
    search: '?initial=foo',
  }),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

describe('Utility Functions', () => {
  test('parseQueryParams should correctly parse search string', () => {
    const search = '?param1=value1&param2=value2';
    const result = parseQueryParams(search);

    expect(result).toEqual({ param1: 'value1', param2: 'value2' });
  });

  test('stringifyQueryParams should correctly stringify object to search string', () => {
    const params = { param1: 'value1', param2: 'value2' };
    const result = stringifyQueryParams(params);

    expect(result).toBe('param1=value1&param2=value2');
  });
});

describe('useQueryState Hook', () => {
  beforeEach(() => {
    mockHistoryPush.mockClear();
  });

  test('history API does not call on page load', () => {
    const { result } = renderHook(() => useQueryState());
    // 1 is test initialization, 2 is mutation
    expect(mockHistoryPush).toBeCalledTimes(0);
    expect(result.current[0]).toEqual({ initial: 'foo' });
  });

  test('initializes with correct default values', () => {
    renderHook(() => useQueryState());

    expect(mockHistoryPush).toBeCalledTimes(0);
  });

  test('setQueryStateValue updates params', () => {
    const { result } = renderHook(() => useQueryState());

    act(() => {
      result.current[1]('newKey1', 'newValue1');
    });
    act(() => {
      result.current[1]('newKey2', 'newValue2');
    });

    expect(result.current[0]).toEqual({
      initial: 'foo',
      newKey1: 'newValue1',
      newKey2: 'newValue2',
    });
  });

  test('empty values are removed', () => {
    const { result } = renderHook(() => useQueryState());

    act(() => {
      result.current[1]('initial', '');
    });

    expect(result.current[0]).toEqual({});
  });

  test('do not call history if its the same value', () => {
    const { result } = renderHook(() => useQueryState());

    act(() => {
      result.current[1]('initial', 'foo');
    });

    expect(result.current[0]).toEqual({ initial: 'foo' });
    expect(mockHistoryPush).toBeCalledTimes(0);
  });

  test('setQueryStateValue updates params and calls history.push', () => {
    const { result } = renderHook(() => useQueryState());

    act(() => {
      result.current[1]('newKey1', 'newValue1');
    });

    expect(mockHistoryPush).toBeCalledTimes(1); // initial and state update
    expect(mockHistoryPush).toHaveBeenLastCalledWith({ search: 'initial=foo&newKey1=newValue1' });
  });
});
