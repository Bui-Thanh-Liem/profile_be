import { Module } from '@nestjs/common';
import { MailService } from './services/Mail.service';
import { OtpService } from './services/Otp.service';
import { FileLocalService } from './services/FileLocal.service';
import { CookieService } from './services/Cookie.service';

@Module({
  imports: [],
  providers: [MailService, OtpService, FileLocalService, CookieService],
  exports: [MailService, OtpService, FileLocalService, CookieService],
})
export class HelperModule {}
