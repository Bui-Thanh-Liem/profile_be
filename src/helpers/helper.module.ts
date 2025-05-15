import { Module } from '@nestjs/common';
import { MailService } from './services/Mail.service';
import { OtpService } from './services/Otp.service';
import { FileLocalService } from './services/FileLocal.service';
import { CookieService } from './services/Cookie.service';
import { SmsService } from './services/Sms.service';
import { CacheService } from './services/cache.service';

@Module({
  imports: [],
  providers: [MailService, OtpService, FileLocalService, CookieService, SmsService, CacheService],
  exports: [MailService, OtpService, FileLocalService, CookieService, SmsService, CacheService],
})
export class HelperModule {}
