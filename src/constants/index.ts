import { Constants } from 'liemdev-profile-lib';

export const CONSTANT_CONFIG = Constants.CONSTANT_CONFIG;
export const CONSTANT_ENV = Constants.CONSTANT_ENV;
export const CONSTANT_TOKEN = Constants.CONSTANT_TOKEN;

export const CONSTANT_QUEUE = {
  QUEUE_MAIL: 'queue-mail',
} as const;

export const CONSTANT_JOB = {
  JOB_SEND_MAIL: 'send-mail',
  JOB_SEND_BULK_MAIL: 'send-bulk-mail',
} as const; // immutable (không thể thay đổi sau khi khai báo).

export type CONSTANT_JOB_TYPE = (typeof CONSTANT_JOB)[keyof typeof CONSTANT_JOB];
