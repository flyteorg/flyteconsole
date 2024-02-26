import { SimpleCacheCallbackManager } from '../SimpleCacheCallbackManager';

jest.useFakeTimers();
const flushPromises = () => new Promise(jest.requireActual('timers').setImmediate);

describe('SimpleCacheCallbackManager', () => {
  let cacheManager: SimpleCacheCallbackManager;

  beforeEach(() => {
    cacheManager = new SimpleCacheCallbackManager({ duration: 200, size: 3 });
  });

  test('it should cache and retrieve data with callbacks', async () => {
    const asyncCallback = jest.fn(async () => 'callbackResult');
    const result1 = await cacheManager.getCachedOrFetch('key1', asyncCallback);
    const result2 = await cacheManager.getCachedOrFetch('key1', asyncCallback);

    // Callback should be called only once
    expect(asyncCallback).toHaveBeenCalledTimes(1);
    expect(result1).toBe('callbackResult');
    expect(result2).toBe('callbackResult');
  });

  test('it should handle cache expiration for callback data', async () => {
    const asyncCallback = jest.fn(async () => 'callbackResult');
    const result1 = await cacheManager.getCachedOrFetch('key2', asyncCallback);

    // Fast-forward time
    jest.advanceTimersByTime(400);
    await flushPromises();

    const result2 = await cacheManager.getCachedOrFetch('key2', asyncCallback);

    // Fast-forward time
    jest.advanceTimersByTime(400);
    await flushPromises();

    const expired = cacheManager.dataCache.get('key2');

    // Callback should be called twice
    expect(asyncCallback).toHaveBeenCalledTimes(2);
    expect(result1).toBe('callbackResult');
    expect(result2).toBe('callbackResult');
    expect(expired).toBe(null);
  });

  test('it should limit cache size for callback data', async () => {
    const asyncCallback1 = jest.fn(async () => 'callbackResult 1');
    const asyncCallback2 = jest.fn(async () => 'callbackResult 2');
    const asyncCallback3 = jest.fn(async () => 'callbackResult 3');
    const asyncCallback4 = jest.fn(async () => 'callbackResult 4');
    const result1a = await cacheManager.getCachedOrFetch('key1', asyncCallback1);
    const result2 = await cacheManager.getCachedOrFetch('key2', asyncCallback2);
    const result3 = await cacheManager.getCachedOrFetch('key3', asyncCallback3);
    // 1 is still in cache
    const result1b = await cacheManager.getCachedOrFetch('key1', asyncCallback1);
    const result1c = await cacheManager.getCachedOrFetch('key1', asyncCallback1);
    // 4 will remove 2 from cache as it was called last recently
    const result4 = await cacheManager.getCachedOrFetch('key4', asyncCallback4);

    const expiredFromSize = await cacheManager.dataCache.get('key2');

    expect(asyncCallback1).toHaveBeenCalledTimes(1);
    expect(asyncCallback2).toHaveBeenCalledTimes(1);
    expect(asyncCallback3).toHaveBeenCalledTimes(1);
    expect(asyncCallback4).toHaveBeenCalledTimes(1);
    expect(result1a).toBe('callbackResult 1');
    expect(result1b).toBe('callbackResult 1');
    expect(result1c).toBe('callbackResult 1');
    expect(result2).toBe('callbackResult 2');
    expect(result3).toBe('callbackResult 3');
    expect(result4).toBe('callbackResult 4');

    expect(expiredFromSize).toBe(null);
  });
});
