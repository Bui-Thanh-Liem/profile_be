import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import Exception from 'src/message-validations/exception.validation';

@Injectable()
export class OtpService {
  private readonly alias = 'otp';
  private readonly ttl = 300; // 2p

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async setOtp(email: string) {
    const otp = `${Math.floor(Math.random() * 900000 + 100000)}`;
    await this.cacheManager.set(`${this.alias}:${email}`, otp, this.ttl);
    return otp;
  }

  async getOtp(email: string) {
    const otp = await this.cacheManager.get(`${this.alias}:${email}`);
    return !otp ? '' : otp;
  }

  async verifyOtp(email: string, otpClient: string) {
    const otpInCache = await this.getOtp(email);
    if (otpInCache !== otpClient) {
      throw new BadRequestException(Exception.invalid('OTP'));
    }
    await this.deleteOtp(email);
    return true;
  }

  async deleteOtp(email: string) {
    await this.cacheManager.del(`${this.alias}:${email}`);
  }
}
