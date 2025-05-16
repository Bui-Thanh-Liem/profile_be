import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

/**
 * Service for interacting with the cache system (wrapper around NestJS CacheManager).
 */
@Injectable()
export class CacheService {
  private readonly alias = 'cache';

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Set a value into the cache with a specific TTL (Time-To-Live).
   *
   * @param key - Cache key.
   * @param val - Value to be stored.
   * @param ttl - Time to live in seconds.
   * @returns The stored value.
   */
  async setCache(key: string, val: any, ttl: number) {
    await this.cacheManager.set(`${this.alias}:${key}`, val, ttl * 1000);
    return val;
  }

  /**
   * Get a value from the cache by key.
   *
   * @param key - Cache key.
   * @returns The value stored in the cache (or undefined if not found).
   */
  async getCache<T>(key: string): Promise<T> {
    const val = (await this.cacheManager.get(`${this.alias}:${key}`)) as T;
    return val;
  }

  /**
   * Delete a key from the cache.
   *
   * @param key - Cache key to be deleted.
   */
  async deleteCache(key: string) {
    await this.cacheManager.del(`${this.alias}:${key}`);
  }

  /**
   * Get a value from the cache by key. If not found, call the fallback function to get the value,
   * store it in cache, and return it.
   *
   * @param key - Cache key.
   * @param fallbackFn - Function to fetch the value if it is not in the cache.
   * @param ttl - Time to live in seconds.
   * @returns The value from cache or from the fallback function.
   */
  async getOrSet<T>(key: string, fallbackFn: () => Promise<T>, ttl: number): Promise<T> {
    const fullKey = `${this.alias}:${key}`;
    const cached = await this.cacheManager.get(fullKey);

    if (cached !== undefined && cached !== null) {
      return cached as T;
    }

    const val = await fallbackFn();
    await this.cacheManager.set(fullKey, val, ttl * 1000);
    return val;
  }
}
