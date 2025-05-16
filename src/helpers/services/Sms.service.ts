import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { UtilArray } from 'src/utils/Array.util';
import { UtilConvert } from 'src/utils/Convert.util';
import { Twilio } from 'twilio';
import { OtpService } from './Otp.service';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  private client: Twilio;

  constructor(private otpService: OtpService) {
    this.client = new Twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  }

  async sendOtp(phone: string) {
    const phoneFormatted = UtilConvert.formatToInternational(phone);

    try {
      this.logger.debug(`Send sms otp for ${phoneFormatted}`);
      const otp = await this.otpService.setOtp(phone);

      const sent = await this.client.messages.create({
        body: `Your OTP code is: ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneFormatted,
      });

      this.logger.debug(`SMS sent successfully: ${JSON.stringify(sent)}`);
      return true;
    } catch (error) {
      this.logger.error(`Error sending OTP to ${phoneFormatted}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Unable to send OTP at this time');
    }
  }

  async sendNotification(phone: string[]) {
    const batchSize = 10;
    const recipientChunks = UtilArray.chunkArray(phone, batchSize);

    //
    for (const chunk of recipientChunks) {
      await Promise.all(
        chunk.map((phone) =>
          this.client.messages.create({
            body: `Notification from liemdev.info.vn`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone,
          }),
        ),
      );
    }

    return true;
  }
}
