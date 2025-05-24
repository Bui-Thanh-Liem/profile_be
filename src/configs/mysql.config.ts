import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CONSTANT_CONFIG, CONSTANT_ENV } from 'src/constants';

export default registerAs(
  CONSTANT_CONFIG.MYSQL,
  (): TypeOrmModuleOptions => ({
    type: 'mysql',
    host: process.env.DB_HOST || 'mysql',
    port: +process.env.DB_PORT || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_DATABASE || 'profile',
    synchronize: process.env.NODE_ENV === CONSTANT_ENV.NODE_ENV.DEV || true,
    entities: [__dirname + '/../**/*.entity.{ts,js}'], // Nếu source code nằm trong `src`
    maxQueryExecutionTime: 3000, // 3s, ghi lại log khi query hơn 3s3s
    poolSize: 10, // Là số lượng kết nối tối đa mà connection pool có thể duy trì ( thay vì đóng và mở kết nối mỗi khi query)
    // logger: 'simple-console', // Ghi log đơn giản vào console
    // logging: ['query', 'error'], // Chỉ ghi log truy vấn và lỗi
  }),
);
