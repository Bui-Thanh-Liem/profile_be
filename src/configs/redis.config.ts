import { registerAs } from '@nestjs/config';
import { RedisOptions } from 'ioredis';
import { CONSTANT_CONFIG } from 'src/constants';

export default registerAs(
  CONSTANT_CONFIG.REDIS,
  (): RedisOptions => ({
    host: process.env.REDIS_HOST || 'localhost',
    port: +process.env.REDIS_PORT || 6379,
    // password: process.env.REDIS_PASSWORD,
  }),
);

// cache-manager-redis-store  -> old
// cache-manager-ioredis      -> old
// cache-manager-ioredis-yet -> deprecated
