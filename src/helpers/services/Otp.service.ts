import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import Exception from 'src/message-validations/exception.validation';

@Injectable()
export class OtpService {
  private readonly alias = 'otp';
  private readonly ttl = 60 * 2000; // 2p

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async setOtp(keyAuth: string) {
    const otp = `${Math.floor(Math.random() * 900000 + 100000)}`;
    await this.cacheManager.set(`${this.alias}:${keyAuth}`, otp, this.ttl);
    return otp;
  }

  async getOtp(keyAuth: string) {
    const otp = await this.cacheManager.get(`${this.alias}:${keyAuth}`);
    return !otp ? '' : otp;
  }

  async verifyOtp(keyAuth: string, otpClient: string) {
    const otpInCache = await this.getOtp(keyAuth);
    if (otpInCache !== otpClient) {
      throw new BadRequestException(Exception.invalid('OTP'));
    }
    await this.deleteOtp(keyAuth);
    return true;
  }

  async deleteOtp(keyAuth: string) {
    await this.cacheManager.del(`${this.alias}:${keyAuth}`);
  }
}
