import { Injectable } from '@nestjs/common';
import { Twilio } from 'twilio';
import { OtpService } from './Otp.service';

@Injectable()
export class SmsService {
  private client: Twilio;

  constructor(private otpService: OtpService) {
    this.client = new Twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  }

  async sendOtp(phone: string) {
    const otp = await this.otpService.setOtp(phone);
    return this.client.messages.create({
      body: `Your OTP code is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
  }

  async sendNotification(phone: string[]) {
    const batchSize = 10;
    const recipientChunks = this.chunkArray(phone, batchSize);

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

  private chunkArray(arr: string[], size: number) {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(size * i, size * i + size));
  }
}
