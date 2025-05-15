import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

// error > warn > info > http > verbose > debug > silly
const levelFilter = (level: string) =>
  winston.format((info) => {
    return info.level === level ? info : undefined;
  })();

const winstonLoggerConfig: WinstonModuleOptions = {
  transports: [
    // Log ra console
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        nestWinstonModuleUtilities.format.nestLike('Profile', {
          prettyPrint: true,
        }),
      ),
    }),

    // Ghi vào file error.log
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error', // Chỉ ghi log mức error
      format: winston.format.combine(levelFilter('error'), winston.format.timestamp(), winston.format.json()),
    }),
    // Ghi vào file warn.log
    new winston.transports.File({
      filename: 'logs/warn.log',
      level: 'warn', // Ghi log từ warn trở lên
      format: winston.format.combine(levelFilter('warn'), winston.format.timestamp(), winston.format.json()),
    }),
    // Ghi vào file info.log
    new winston.transports.File({
      filename: 'logs/info.log',
      level: 'info', // Ghi log từ info trở lên
      format: winston.format.combine(levelFilter('info'), winston.format.timestamp(), winston.format.json()),
    }),
    // Ghi vào file debug.log
    new winston.transports.File({
      filename: 'logs/debug.log',
      level: 'debug', // Ghi log từ debug trở lên
      format: winston.format.combine(levelFilter('debug'), winston.format.timestamp(), winston.format.json()),
    }),
  ],
};

export default winstonLoggerConfig;
