import { createKeyv } from '@keyv/redis';
import { BullModule } from '@nestjs/bullmq';
import { CacheModule, CacheModuleOptions } from '@nestjs/cache-manager';
import { ClassSerializerInterceptor, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CacheableMemory } from 'cacheable';
import { RedisOptions } from 'ioredis';
import { Keyv } from 'keyv';
import { HealthController } from './app.controller';
import { AppService } from './app.service';
import { MysqlConfig, RedisConfig } from './configs/index';
import { CONSTANT_CONFIG, CONSTANT_ENV } from './constants/index';
import { HttpExceptionFilter } from './filters/httpException.filter';
import { TypeOrmExceptionFilter } from './filters/typeOrmException.filter';
import { JwtAuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/role.guard';
import { HelperModule } from './helpers/helper.module';
import { ErrorInterceptor } from './interceptors/ErrorInterceptor.interceptor';
import { QueueMailModule } from './libs/bull/queue-mail/queue-mail.module';
import { QueueSmsModule } from './libs/bull/queue-sms/queue-sms.module';
import { QueueTestModule } from './libs/bull/queue-test/queue-test.module';
import { TaskModule } from './libs/tasks/task.module';
import { TokenModule } from './libs/token/token.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { AboutModule } from './routes/about/about.module';
import { AuthModule } from './routes/auth/auth.module';
import { CustomerModule } from './routes/customer/customer.module';
import { RoleGroupModule } from './routes/role-group/role-group.module';
import { RoleModule } from './routes/role/role.module';
import { SendMailModule } from './routes/send-mail/send-mail.module';
import { SkillModule } from './routes/skill/skill.module';
import { KeyWordModule } from './routes/storages/keyword/keyword.module';
import { KnowledgeModule } from './routes/storages/knowledge/knowledge.module';
import { TestModule } from './routes/test/test.module';
import { UserModule } from './routes/user/user.module';
import { JwtAuthStrategy } from './strategies/auth.strategy';
import { NoteModule } from './routes/storages/note/note.module';

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

    // Load cache
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<CacheModuleOptions> => {
        const config = configService.get<RedisOptions>(CONSTANT_CONFIG.REDIS);

        if (!config) {
          throw new Error('Cache configuration not found');
        }

        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
            }),
            createKeyv(`redis://${config.host}:${config.port}`),
          ],
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
    QueueSmsModule,
    QueueTestModule,

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
    KnowledgeModule,
    AboutModule,
    SkillModule,
    TestModule,
    NoteModule,
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
    {
      provide: APP_GUARD, // toàn bộ ứng trừ Public()
      useClass: RolesGuard,
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
