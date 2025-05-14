import { Inject, Injectable } from '@nestjs/common';
import { UserService } from './routers/user/user.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UserEntity } from './routers/user/entities/user.entity';

@Injectable()
export class AppService {
  constructor(
    private readonly userService: UserService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async protected(id: string) {
    const key = `userActive:${id}`;
    console.log('key:::', key);

    try {
      const userActiveCache = await this.cacheManager.get<UserEntity>(key);
      console.log('userActiveCache:::', userActiveCache);

      if (userActiveCache) return userActiveCache;

      const userActive = await this.userService.findOneById(id);
      if (userActive) {
        const r = await this.cacheManager.set(key, userActive, 600);
        console.log('r:::', r);
      }
      return userActive;
    } catch (error) {
      // Log error (use NestJS Logger or your preferred logging solution)
      console.error(`Error in protected method for id ${id}:`, error);
      throw new Error('Unable to retrieve user data');
    }
  }
}
