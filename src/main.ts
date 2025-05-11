import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import helmet from 'helmet';

//
import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import { winstonLoggerConfig } from './configs/logger.config';
// import { HttpExceptionFilter } from './filters/httpException.filter';
// import { JwtService } from '@nestjs/jwt';
// import { AuthGuard } from './guards/auth.guard';
// import { NotFoundExceptionFilter } from './filters/not-found.middleware';
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true, // cần thiết để bắt log sớm (ghi tất cả các log initial và mapping) ->
    // Nest tạo một logger tạm (buffered logger) để lưu trữ log tạm thời.
    // app.useLogger(WinstonModule.createLogger(winstonLoggerConfig));
    // Nest phát lại các log đã buffer
    //  - Ghi ra file (nếu level phù hợp)
    //  - Hiển thị trên console (nếu có cấu hình ConsoleTransport)
  });

  //
  app.useLogger(WinstonModule.createLogger(winstonLoggerConfig));

  //
  app.setGlobalPrefix('/api/v1');

  // Compression response -> client
  app.use(compression());

  // Protect technologies
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'same-site' }, // Cho phép client truy cập tài nguyên từ server
    }),
  );

  // Process cookies
  app.use(cookieParser());

  //
  app.enableCors({
    origin: [process.env.CLIENT_HOST],
    methods: ['HEAD', 'GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true, // access send request credentials(token, cookie, session) (client)
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'], // (client)
  });

  // Convert json to javascript and check limit
  app.use(json({ limit: '10mb' }));

  // Check HTTP , extended : true => complicated
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // Using validation global @IsString(), @IsInt(), @IsNotEmpty(), v.v., from class-validator.
  app.useGlobalPipes(
    new ValidationPipe({
      // whitelist: true, // Tự động loại bỏ các field khi không có decorator trong DTO -> server không thấy field đó
      forbidNonWhitelisted: true, // Bắt lỗi khi client gửi field không có trong DTO lên hoặc field đó không có decorator
      transformOptions: {
        // enableImplicitConversion: true, // Tự động chuyển type ngầm định,  VD 123 => '123'   # "nguy hiem"
      },
      exceptionFactory: (validationError) => {
        console.log('validationError::::', validationError);
        const err = validationError?.map((validateError) => ({
          field: validateError.property,
          error: validateError.constraints, // message errors
        }));
        throw new UnprocessableEntityException(err);
      },
    }),
  );

  //
  // const jwtService = app.get(JwtService);
  // const reflector = app.get(Reflector);
  // app.useGlobalGuards(new AuthGuard(jwtService, reflector));

  //
  // app.useGlobalFilters(
  //   new HttpExceptionFilter(),
  //   new NotFoundExceptionFilter(),
  // );

  app.useStaticAssets(join(__dirname, '..', 'public'), { prefix: '/' });

  //
  const configSwagger = new DocumentBuilder().setTitle('My profile').setVersion('1.0').build();
  const documentSwagger = SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('api', app, documentSwagger);

  await app.listen(process.env.SERVER_PORT || 9000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
