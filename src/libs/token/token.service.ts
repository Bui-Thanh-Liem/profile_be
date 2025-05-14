import { BadRequestException, forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { IResultRefreshToken, IResultSignToken } from 'src/interfaces/result.interface';
import Exception from 'src/message-validations/exception.validation';
import { TPayloadToken } from 'src/types/TPayloadToken.type';
import { isExitItem } from 'src/utils/isPredicates.util';
import { Repository } from 'typeorm';
import { UserEntity } from '../../routers/user/entities/user.entity';
import { UserService } from '../../routers/user/user.service';
import { RevokeTokenDto } from './dto/revoke-token.dto';
import { SignTokenDto } from './dto/sign-token.dto';
import { TokenEntity } from './entities/token.entity';
import { CustomerEntity } from 'src/routers/customer/entities/customer.entity';
import { CustomerService } from 'src/routers/customer/customer.service';
@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(TokenEntity)
    private tokenRepository: Repository<TokenEntity>,
    private jwtService: JwtService,

    @Inject(forwardRef(() => UserService))
    private userService: UserService,

    @Inject(forwardRef(() => CustomerService))
    private customerService: CustomerService,
  ) {}

  async signToken(payload: SignTokenDto): Promise<IResultSignToken> {
    const { user, customer, deviceInfo, ipAddress } = payload;

    //
    const payloadToken: TPayloadToken = user ? { userId: user.id } : { customerId: customer.id };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payloadToken, {
        secret: process.env.SECRET_ACCESS_KEY,
        expiresIn: '3d',
      }),
      this.jwtService.signAsync(payloadToken, {
        secret: process.env.SECRET_REFRESH_KEY,
        expiresIn: '7d',
      }),
    ]);

    //
    const dataCreate = this.tokenRepository.create({
      token: accessToken,
      refreshToken: refreshToken,
      user: user as unknown as Omit<UserEntity, 'password'>,
      customer: customer as unknown as Omit<CustomerEntity, 'password'>,
      deviceInfo,
      ipAddress,
      expiresAt: this.getTimeExpired(3),
      refreshTokenExpiresAt: this.getTimeExpired(7),
    });
    await this.tokenRepository.save(dataCreate);

    //
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<IResultRefreshToken> {
    // Tìm refresh token trong database
    const findToken = await this.tokenRepository.findOne({
      where: { refreshToken },
    });

    // Kiểm tra
    if (
      !findToken || // tồn tại
      findToken.isRevoked || // thu hồi (block)
      findToken.isRefreshTokenExpired() // refresh-token hết hạn chưa
    ) {
      throw new UnauthorizedException(Exception.loginAgain());
    }

    // kiểm tra user của token này có trong database không
    // const user = await this.userService.findOneById(findToken.user?.id);
    // if (!user) {
    //   throw new UnauthorizedException(Exception.notfound('User'));
    // }

    // const customer = await this.customerService.findOneById(findToken.customer?.id);
    // if (!user) {
    //   throw new UnauthorizedException(Exception.notfound('Customer'));
    // }

    // kiểm tra tính hợp lệ của refresh token
    const payload = await this.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedException(Exception.invalid('refresh token'));
    }

    //
    const [newAccessToken, newRefreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.SECRET_ACCESS_KEY,
        expiresIn: '3d',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.SECRET_REFRESH_KEY,
        expiresIn: '7d',
      }),
    ]);

    //
    const tokenUpdated = await this.tokenRepository.save({
      ...findToken,
      token: newAccessToken,
      refreshToken: newRefreshToken,
      expiresAt: this.getTimeExpired(3),
      refreshTokenExpiresAt: this.getTimeExpired(7),
    });
    if (!tokenUpdated) {
      throw new UnauthorizedException(Exception.fail('Refresh token'));
    }

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    };
  }

  async revokeToken(payload: RevokeTokenDto) {
    const { token, refreshToken } = payload;
    if (!token && !refreshToken) return false;

    //
    const findToken = await this.tokenRepository.findOne({
      where: [{ token }, { refreshToken }],
    });

    //
    if (!isExitItem(findToken)) {
      throw new UnauthorizedException(Exception.notfound('Token'));
    }

    //
    const revoked = await this.tokenRepository.save({
      ...findToken,
      isRevoked: true,
    });

    //
    return !!revoked.id;
  }

  //
  createTokenTemp<T extends object>(payload: T, expiresIn: number) {
    const token = this.jwtService.sign(payload, {
      secret: process.env.SECRET_ACCESS_KEY,
      expiresIn: expiresIn,
    });
    return token;
  }

  async verifyAccessToken<T extends object>(token: string): Promise<T> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRET_ACCESS_KEY,
      });
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  async verifyRefreshToken(token: string): Promise<TPayloadToken> {
    return await this.jwtService.verifyAsync(token, {
      secret: process.env.SECRET_REFRESH_KEY,
    });
  }

  getTimeExpired(num: number) {
    return new Date(Date.now() + num * 24 * 60 * 60 * 1000);
  }
}

// Mỗi lần đăng nhập sẽ tạo ra 1 token (access, refresh, expiresAt, expiresRefreshAt, isRevoke)
