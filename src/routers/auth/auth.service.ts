import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Enums } from 'liemdev-profile-lib';
import { OtpService } from 'src/helpers/services/Otp.service';
import { IUser } from 'src/interfaces/models.interface';
import { IPayloadTokenOtp } from 'src/interfaces/payload.interface';
import { IResponseLogin } from 'src/interfaces/response.interface';
import { IResultRefreshToken } from 'src/interfaces/result.interface';
import { QueueMailService } from 'src/libs/bull/queue-mail/queue-mail.service';
import Exception from 'src/message-validations/exception.validation';
import { Repository } from 'typeorm';
import { TokenService } from '../../libs/token/token.service';
import { UserEntity } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  expiryMinutes = 5;

  constructor(
    private tokenService: TokenService,
    private userService: UserService,
    private otpService: OtpService,
    private queueMailService: QueueMailService,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  //
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new UnauthorizedException(Exception.unAuthorization());
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(Exception.unAuthorization());
    }

    const { password: passwordInDatabase, ...result } = user;

    return result;
  }

  async login(
    userLogged: Omit<IUser, 'password'>,
    deviceInfo: string,
    ipAddress: string,
  ): Promise<IResponseLogin<any>> {
    // Đã xác thực mật khẩu và email ở guard-local

    //
    const { access_token, refresh_token } = await this.tokenService.signToken({
      user: userLogged,
      deviceInfo,
      ipAddress,
    });

    return {
      user: userLogged,
      token: {
        access_token,
        refresh_token,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<IResultRefreshToken> {
    const tokenRefresh = await this.tokenService.refreshToken(refreshToken);
    return tokenRefresh;
  }

  async enterEmail(email: string, userAgent: string, ip: string): Promise<boolean> {
    //
    const findUser = await this.userService.findOneByEmail(email); // check exist in userService

    //
    const otp = await this.otpService.setOtp(findUser.email);

    //
    const token = this.tokenService.createTokenTemp(
      {
        email: findUser.email,
        ip,
        userAgent,
      },
      300,
    );

    //
    const mailSent = await this.queueMailService.sendMail({
      to: findUser.email,
      subject: '"LiemDev 👻" <no-reply@gmail.com>',
      templateName: 'otp.template',
      variables: {
        rootLogo: `${process.env.CLIENT_HOST}/logo.png`,
        rootUrlWeb: `${process.env.CLIENT_HOST}`,
        requestTime: new Date(),
        otpCode: otp,
        fullName: findUser.fullName,
        expiryMinutes: this.expiryMinutes,
        verificationLink: `${process.env.CLIENT_HOST}/reset-password/${token}`,
      },
      type: Enums.ETypeMail.FORM_OTP,
    });

    return !!otp && mailSent;
  }

  async confirmOtp(otpConfirm: string, token: string, userAgent: string, ip: string): Promise<{ token: string }> {
    let valid: IPayloadTokenOtp;
    try {
      valid = await this.tokenService.verifyAccessToken(token);
    } catch (error) {
      throw new UnauthorizedException(Exception.invalidToken());
    }
    if (!valid || valid.userAgent !== userAgent || valid.ip !== ip) {
      throw new UnauthorizedException(Exception.invalidToken());
    }

    const otp = await this.otpService.getOtp(valid.email);
    if (otp !== otpConfirm) {
      throw new UnauthorizedException(Exception.invalid('OTP, please again !'));
    }

    //
    const newToken = this.tokenService.createTokenTemp(
      {
        email: valid.email,
        ip,
        userAgent,
      },
      300,
    );

    return { token: newToken };
  }

  async resetPassword(newPassword: string, token: string, userAgent: string, ip: string): Promise<boolean> {
    //
    let valid: IPayloadTokenOtp;
    try {
      valid = await this.tokenService.verifyAccessToken(token);
    } catch (error) {
      throw new UnauthorizedException(Exception.invalidToken());
    }
    if (!valid || valid.userAgent !== userAgent || valid.ip !== ip) {
      throw new UnauthorizedException(Exception.invalidToken());
    }

    //
    const findUser = await this.userService.findOneByEmail(valid.email);
    if (!findUser) {
      throw new NotFoundException(Exception.notfound('User'));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const resetPass = await this.userRepository.update(findUser.id, {
      password: hashedPassword,
    });

    return !!resetPass.affected;
  }

  async logout(refreshToken: string) {
    try {
      this.tokenService.verifyAccessToken(refreshToken);

      // 1. Thu hồi token để kiểm tra lịch sử đăng nhập
      const revoked = await this.tokenService.revokeToken({ refreshToken: refreshToken });
      if (!revoked) {
        throw new BadRequestException('Revoke token fail');
      }

      // 2. Xoá token khỏi trong database luôn
      /**
       * code
       */
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
