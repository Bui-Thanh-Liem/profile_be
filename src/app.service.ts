import { BadRequestException, Injectable } from '@nestjs/common';
import Exception from 'src/message-validations/exception.validation';
import { CacheService } from './helpers/services/Cache.service';
import { CustomerService } from './routers/customer/customer.service';
import { UserEntity } from './routers/user/entities/user.entity';
import { UserService } from './routers/user/user.service';
import { createKeyCustomerActive, createKeyUserActive } from './utils/createKeyCache';

@Injectable()
export class AppService {
  constructor(
    private readonly userService: UserService,
    private readonly customerService: CustomerService,
    private cacheService: CacheService,
  ) {}

  async protectedUser(id: string) {
    const key = createKeyUserActive(id);

    try {
      const userActiveCache = await this.cacheService.getCache<UserEntity>(key);
      console.log('userActiveCache:::', userActiveCache);

      if (userActiveCache) return userActiveCache;

      const userActive = await this.userService.findOneById(id);
      await this.cacheService.setCache(key, userActive, 600);
      return userActive;
    } catch (error) {
      console.error(`Error in protected method for id ${id}:`, error);
      throw new BadRequestException(Exception.loginAgain());
    }
  }

  async protectedCustomer(id: string) {
    const key = createKeyCustomerActive(id);

    try {
      const customerActiveCache = await this.cacheService.getCache<UserEntity>(key);
      console.log('customerActiveCache:::', customerActiveCache);
      console.log('id customer:::', id);

      if (customerActiveCache) return customerActiveCache;

      const customerActive = await this.customerService.findOneById(id);
      await this.cacheService.setCache(key, customerActive, 600);
      return customerActive;
    } catch (error) {
      throw new BadRequestException(Exception.loginAgain());
    }
  }
}
