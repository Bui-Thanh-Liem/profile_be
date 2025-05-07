import { Module } from '@nestjs/common';
import { MailService } from './services/Mail.service';
import { OtpService } from './services/Otp.service';
import { HandleLocalFileService } from './services/HandleLocalFile.service';
import { CookieService } from './services/Cookie.service';

@Module({
  imports: [],
  providers: [MailService, OtpService, HandleLocalFileService, CookieService],
  exports: [MailService, OtpService, HandleLocalFileService, CookieService],
})
export class HelperModule {}
