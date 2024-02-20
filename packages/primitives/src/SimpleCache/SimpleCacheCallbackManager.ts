import { SimpleCache, SimpleCacheConfig, SimpleCacheConfigDefaults } from './SimpleCache';

/**
 * Promise based simple data cache with time based expiration.
 * This both prevents exessive calls to the same endpoint and
 * saves the result in memory for a short time.
 *
 * 30s default cache duration.
 * 10 items by default retained in memory.
 * 
 * @example
 * Example usage:
 * const cacheManager = new FIFOCacheManager(5); // Limit to 5 cached responses

 * async function fetchAndCacheData(key) {
 *   const requestConfig = {
 *     method: 'get',
 *     url: `https://example.com/api/data/${key}`,
 *   };
 * 
 *   try {
 *     const response = await cacheManager.getCachedOrFetch(key, requestConfig);
 *     console.log(response.data);
 *   } catch (error) {
 *     console.error(error);
 *   }
 * }
 */
export class SimpleCacheCallbackManager {
  dataCache: SimpleCache<any>;
  callbackCache: SimpleCache<Promise<any>>;

  constructor({
    duration = SimpleCacheConfigDefaults.duration,
    size = SimpleCacheConfigDefaults.size,
  }: Partial<SimpleCacheConfig> = {}) {
    this.dataCache = new SimpleCache<any>({ size, duration });
    this.callbackCache = new SimpleCache<Promise<any>>({ size, duration });
  }

  async getCachedOrFetch(key: string, asyncCallback: () => Promise<any>) {
    // does data exist in cache?
    if (this.dataCache.get(key)) {
      const result = this.dataCache.get(key);

      // reset priority order, "invoced" most recently
      this.dataCache.set(key, result);
    }

    // does callback exist in cache?
    let callbackInCache = this.callbackCache.get(key);
    // if not, add callback to cache
    if (!callbackInCache) {
      const promiseCallback = asyncCallback();
      callbackInCache = this.callbackCache.set(key, promiseCallback);
    } else {
      // reset priority order
      this.dataCache.set(key, callbackInCache);
    }

    // If the key is not in the cache, make a new request
    let response = callbackInCache;
    // verify cache was not cleared while waiting for asyncCallback
    if (!response) {
      // if the response is in the cache, return it
      response = asyncCallback();
    }

    // Add the response to the cache and FIFO queue
    // async .then to be non-blocking
    try {
      response
        .then((resolved) => {
          // cache data
          this.dataCache.set(key, resolved);
        })
        .catch((error) => {
          // error from API/callback error
          throw error;
        });
      return response;
    } catch (error) {
      // something went wrong
      // make the call anyway
      // this should never happen
      // perform callback again to prevent broken UX

      // TODO: add oncall error logging
      // eslint-disable-next-line no-console
      console.error(`cache callback retry`, error);

      // eslint-disable-next-line no-useless-catch
      try {
        const response = await asyncCallback();
        return response;
      } catch (error) {
        // error from API/callback error
        throw error;
      }
    }
  }
}
