import { Constants } from 'liemdev-profile-lib';

export const CONSTANT_CONFIG = Constants.CONSTANT_CONFIG;
export const CONSTANT_ENV = Constants.CONSTANT_ENV;
export const CONSTANT_TOKEN = Constants.CONSTANT_TOKEN;

export const CONSTANT_QUEUE = {
  QUEUE_MAIL: 'queue-mail',
  QUEUE_SMS: 'queue-sms',
  QUEUE_TEST: 'queue-test',
} as const;

export const CONSTANT_JOB = {
  JOB_SEND_MAIL: 'send-mail',
  JOB_SEND_BULK_MAIL: 'send-bulk-mail',
  JOB_SEND_SMS: 'send-sms',
  JOB_SEND_BULK_SMS: 'send-bulk-sms',
  JOB_SEND_BULK_TEST_USER: 'send-bulk-test-user',
} as const; // immutable (không thể thay đổi sau khi khai báo).

export const CONSTANT_DECORATOR = {
  KEY_ROLES: 'key-roles',
} as const;

export type CONSTANT_JOB_TYPE = (typeof CONSTANT_JOB)[keyof typeof CONSTANT_JOB];
