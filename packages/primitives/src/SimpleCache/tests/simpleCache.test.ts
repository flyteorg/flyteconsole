import { SimpleCache } from '../SimpleCache';

jest.useFakeTimers();
const flushPromises = () => new Promise(jest.requireActual('timers').setImmediate);

describe('SimpleCache', () => {
  it('should be initially empty', () => {
    const cache = new SimpleCache<string>();
    expect(cache.get('test')).toBe(null);
  });

  // Test case 2: Test setting and getting data
  it('should set and get data', () => {
    const cache = new SimpleCache<number>();

    // Set data in the cache
    cache.set('42', 42);

    // Check if the data can be retrieved
    expect(cache.get('42')).toBe(42);
  });

  it('should expire the cache after the specified duration', () => {
    // Set a cache duration of 1 second for testing
    const cache = new SimpleCache<string>({ duration: 1000 });

    // Set data in the cache
    cache.set('hello', 'Hello, World!');

    // Wait for the cache to expire
    jest.advanceTimersByTime(2000); // Fast-forward time by 2 seconds

    // Check if the cache is expired
    expect(cache.get('hello')).toBe(null);
  });

  it('should store and retrieve values with custom cache durations', async () => {
    const cache = new SimpleCache<string>();

    // Set a value with a custom cache duration
    cache.set('key1', 'Value 1', 2000);

    // Wait for a short time (less than the cache duration)
    jest.advanceTimersByTime(1000);
    await flushPromises();

    // Retrieve the value before it expires
    expect(cache.get('key1')).toBe('Value 1');

    // Wait for the cache item to expire
    jest.advanceTimersByTime(2000);
    await flushPromises();

    // Verify that the cache item has expired
    expect(cache.get('key1')).toBe(null);
  });

  it('should use the default cache duration if not specified', async () => {
    const cache = new SimpleCache<number>({ duration: 3000 });

    // Set a value without specifying the cache duration
    cache.set('key2', 42);

    // Wait for a short time (less than the default cache duration)
    jest.advanceTimersByTime(2000);
    await flushPromises();

    // Retrieve the value before it expires
    expect(cache.get('key2')).toBe(42);

    // Wait for the cache item to expire based on the default duration
    jest.advanceTimersByTime(1500);
    await flushPromises();

    // Verify that the cache item has expired
    expect(cache.get('key2')).toBe(null);
  });

  it('should store and retrieve values with custom cache durations', () => {
    const cache = new SimpleCache<string>();

    // Set a value with a custom cache duration
    cache.set('key1', 'Value 1', 2000);

    // Wait for a short time (less than the cache duration)
    jest.advanceTimersByTime(1000);

    // Retrieve the value before it expires
    expect(cache.get('key1')).toBe('Value 1');

    // Wait for the cache item to expire
    jest.advanceTimersByTime(2000);

    // Verify that the cache item has expired
    expect(cache.get('key1')).toBe(null);
  });

  it('should use the default cache duration if not specified', () => {
    const cache = new SimpleCache<number>({ duration: 3000 });

    // Set a value without specifying the cache duration
    cache.set('key2', 42);

    // Wait for a short time (less than the default cache duration)
    jest.advanceTimersByTime(2000);

    // Retrieve the value before it expires
    expect(cache.get('key2')).toBe(42);

    // Wait for the cache item to expire based on the default duration
    jest.advanceTimersByTime(1500);

    // Verify that the cache item has expired
    expect(cache.get('key2')).toBe(null);
  });

  it('should store and retrieve values within the maximum cache size', () => {
    const cache = new SimpleCache<string>({
      size: 3,
    });

    // Set values within the maximum cache size
    cache.set('key1', 'Value 1');
    cache.set('key2', 'Value 2');
    cache.set('key3', 'Value 3');

    // Retrieve the values
    expect(cache.get('key1')).toBe('Value 1');
    expect(cache.get('key2')).toBe('Value 2');
    expect(cache.get('key3')).toBe('Value 3');
  });

  it('should remove the oldest value when the maximum cache size is exceeded', () => {
    const cache = new SimpleCache<number>({ size: 2 });

    // Set values to exceed the maximum cache size
    cache.set('key1', 42);
    cache.set('key2', 43);
    cache.set('key3', 44);

    // Check the oldest value is removed
    expect(cache.get('key1')).toBe(null);
    expect(cache.get('key2')).toBe(43);
    expect(cache.get('key3')).toBe(44);
  });
});
