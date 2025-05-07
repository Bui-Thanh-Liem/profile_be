import { registerAs } from '@nestjs/config';
import { RedisOptions } from 'ioredis';

export default registerAs(
  'redis',
  (): RedisOptions => ({
    host: process.env.REDIS_HOST || 'redis',
    port: +process.env.REDIS_PORT || 6379,
    // password: process.env.REDIS_PASSWORD,
  }),
);

// cache-manager-redis-store  -> old
// cache-manager-ioredis      -> old
// cache-manager-ioredis-yet -> deprecated
