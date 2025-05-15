import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly alias = 'cache';

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async setCache(key: string, val: any, ttl: number) {
    await this.cacheManager.set(`${this.alias}:${key}`, val, ttl);
    return val;
  }

  async getCache<T>(key: string): Promise<T> {
    const val = (await this.cacheManager.get(`${this.alias}:${key}`)) as T;
    return val;
  }

  async deleteCache(key: string) {
    await this.cacheManager.del(`${this.alias}:${key}`);
  }
}
