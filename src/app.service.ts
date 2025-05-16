import { Injectable } from '@nestjs/common';
import { CacheService } from './helpers/services/Cache.service';
import { UserEntity } from './routers/user/entities/user.entity';
import { UserService } from './routers/user/user.service';

@Injectable()
export class AppService {
  constructor(
    private readonly userService: UserService,
    private cacheService: CacheService,
  ) {}

  async protected(id: string) {
    const key = `userActive:${id}`;

    try {
      const userActiveCache = await this.cacheService.getCache<UserEntity>(key);
      console.log('userActiveCache:::', userActiveCache);

      if (userActiveCache) return userActiveCache;

      const userActive = await this.userService.findOneById(id);
      if (userActive) {
        const r = await this.cacheService.setCache(key, userActive, 600);
      }
      return userActive;
    } catch (error) {
      console.error(`Error in protected method for id ${id}:`, error);
      throw new Error('Unable to retrieve user data');
    }
  }
}
