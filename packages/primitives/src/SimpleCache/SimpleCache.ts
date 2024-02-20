export interface SimpleCacheItem<T> {
  data: T;
  expiration: number;
}

export interface SimpleCacheConfig {
  duration: number;
  size: number;
}

export const SimpleCacheConfigDefaults: SimpleCacheConfig = {
  duration: 30 * 1000,
  size: 10,
};

/**
 * Simple data cache with time based expiration.
 * 30s default cache duration.
 * 10 items by default retained in memory.
 */
export class SimpleCache<T> {
  private cache: Record<string, SimpleCacheItem<T>> = {};
  private cacheOrder: string[] = [];
  private defaultCacheDuration: number;
  private maxCacheSize: number;

  constructor({
    duration = SimpleCacheConfigDefaults.duration,
    size = SimpleCacheConfigDefaults.size,
  }: Partial<SimpleCacheConfig> = {}) {
    this.defaultCacheDuration = duration;
    this.maxCacheSize = size;
  }

  set(key: string, data: T, cacheDuration: number = this.defaultCacheDuration): T {
    const expiration = Date.now() + cacheDuration;
    this.cache[key] = { data, expiration };

    // is key in the cache?
    // if so, move it to the end of the queue
    const index = this.cacheOrder.indexOf(key);
    if (index !== -1) {
      this.cacheOrder.splice(index, 1);
    }

    this.cacheOrder.push(key);

    if (this.cacheOrder.length > this.maxCacheSize) {
      const removedKey = this.cacheOrder.shift();
      if (removedKey) {
        delete this.cache[removedKey];
      }
    }

    return this.get(key) as T;
  }

  setAsync = async (
    key: string,
    data: T,
    cacheDuration: number = this.defaultCacheDuration,
  ): Promise<T> => {
    return new Promise((resolve) => {
      this.set(key, data, cacheDuration);
      resolve(this.get(key) as T);
    });
  };

  get(key: string): T | null {
    const cacheItem = this.cache[key];
    if (!cacheItem || this.isCacheExpired(cacheItem)) {
      return null;
    }
    return cacheItem.data;
  }

  getAsync = async (key: string): Promise<T | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.get(key));
      }, 0);
    });
  };

  // eslint-disable-next-line class-methods-use-this
  private isCacheExpired(cacheItem: SimpleCacheItem<T>): boolean {
    const currentTime = Date.now();
    return currentTime >= cacheItem.expiration;
  }
}
