import KeyvRedis, { Keyv } from '@keyv/redis';
import { BullModule } from '@nestjs/bullmq';
import { CacheModule, CacheModuleOptions } from '@nestjs/cache-manager';
import { ClassSerializerInterceptor, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RedisOptions } from 'ioredis';
import { HealthController } from './app.controller';
import { MysqlConfig, RedisConfig } from './configs/index';
import { CONSTANT_CONFIG, CONSTANT_ENV } from './constants/index';
import { HttpExceptionFilter } from './filters/httpException.filter';
import { TypeOrmExceptionFilter } from './filters/typeOrmException';
import { JwtAuthGuard } from './guards/auth.guard';
import { HelperModule } from './helpers/helper.module';
import { ErrorInterceptor } from './interceptors/ErrorInterceptor.interceptor';
import { QueueMailModule } from './libs/bull/queue-mail/queue-mail.module';
import { TaskModule } from './libs/tasks/task.module';
import { TokenModule } from './libs/token/token.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { AboutModule } from './routers/about/about.module';
import { AuthModule } from './routers/auth/auth.module';
import { RoleGroupModule } from './routers/role-group/role-group.module';
import { RoleModule } from './routers/role/role.module';
import { SendMailModule } from './routers/send-mail/send-mail.module';
import { SkillModule } from './routers/skill/skill.module';
import { KeyWordModule } from './routers/storages/keyword/keyword.module';
import { SubjectGroupModule } from './routers/storages/subject-group/subject-group.module';
import { SubjectItemModule } from './routers/storages/subject-item/subject-item.module';
import { UserModule } from './routers/user/user.module';
import { JwtAuthStrategy } from './strategies/auth.strategy';
import { CustomerModule } from './routers/customer/customer.module';
import { LikeModule } from './routers/storages/like/like.module';
import { AppService } from './app.service';

@Module({
  imports: [
    // config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === CONSTANT_ENV.NODE_ENV.DEV ? '.env.dev' : '.env',
      load: [MysqlConfig, RedisConfig],
    }),

    // typeOrm
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get<TypeOrmModuleOptions>(CONSTANT_CONFIG.MYSQL) || {},
    }),

    // cache
    CacheModule.registerAsync({
      isGlobal: true, // Đặt CacheModule là global
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): CacheModuleOptions => {
        const redisConfig = configService.get('redis');
        if (!redisConfig) {
          throw new Error('Redis configuration not found');
        }

        // Tạo Keyv instance với Redis store
        const redisUrl = `redis://${redisConfig.host}:${redisConfig.port}`;
        const keyvRedis = new KeyvRedis(redisUrl);

        const store = new Keyv({
          store: keyvRedis,
          namespace: 'cache', // Namespace cho cache
        });

        return {
          store: store, // Truyền Keyv instance vào cache-manager
          ttl: 600, // Thời gian sống (seconds)
        };
      },
    }),

    // tasks
    TaskModule,

    // Queue
    BullModule.forRootAsync({
      //  cấu hình kết nối redis chung
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: configService.get<RedisOptions>('redis') || {},
      }),
    }),
    QueueMailModule,

    // list module
    HelperModule,
    UserModule,
    CustomerModule,
    AuthModule,
    RoleModule,
    TokenModule,
    RoleGroupModule,
    KeyWordModule,
    SendMailModule,
    SubjectGroupModule,
    SubjectItemModule,
    AboutModule,
    SkillModule,
    LikeModule,
  ],
  controllers: [HealthController],
  providers: [
    JwtAuthStrategy,
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor, // Chuẩn hóa dữ liệu trả về cho client
    },
    {
      provide: APP_FILTER,
      useClass: TypeOrmExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD, // toàn bộ ứng trừ Public()
      useClass: JwtAuthGuard, // NestJS sẽ tự inject JwtService & Reflector
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('/');
  }
}

// 1️⃣ Client gửi request
// ⬇
// 2️⃣ Middleware xử lý request
// ⬇
// 3️⃣ Guards kiểm tra quyền truy cập
// ⬇
// 4️⃣ Interceptors ghi log / modify dữ liệu
// ⬇
// 5️⃣ Pipes validate dữ liệu đầu vào
// ⬇
// 6️⃣ Router (Controller & Service) xử lý logic
// ⬇
// 7️⃣ Interceptor modify response trước khi trả về
// ⬇
// 8️⃣ Client nhận response
