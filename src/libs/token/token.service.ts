import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { IResultRefreshToken, IResultSignToken } from 'src/interfaces/result.interface';
import Exception from 'src/message-validations/exception.validation';
import { CustomerEntity } from 'src/routers/customer/entities/customer.entity';
import { TPayloadToken } from 'src/types/TPayloadToken.type';
import { In, Repository } from 'typeorm';
import { UserEntity } from '../../routers/user/entities/user.entity';
import { RevokeTokenDto, RevokeTokenToLogoutDto } from './dto/revoke-token.dto';
import { SignTokenDto } from './dto/sign-token.dto';
import { TokenEntity } from './entities/token.entity';
@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(TokenEntity)
    private tokenRepository: Repository<TokenEntity>,
    private jwtService: JwtService,
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

  //
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

  //
  async revokeToken(payload: RevokeTokenDto) {
    try {
      const { userIds } = payload;
      if (userIds.length <= 0) return false;

      //
      const tokens = await this.tokenRepository.find({
        where: {
          user: In(userIds),
        },
      });

      //
      if (tokens.length <= 0) {
        throw new UnauthorizedException('This user is not logged in.');
      }

      await Promise.all(
        tokens.map((token) => {
          this.tokenRepository.save(this.tokenRepository.create({ ...token, isRevoked: true }));
        }),
      );

      //
      return true;
    } catch (error) {
      console.log('Revoke token fail !');
      throw new BadRequestException('Revoke token fail !');
    }
  }

  //
  async revokeTokenToLogout(payload: RevokeTokenToLogoutDto) {
    try {
      const { token, refreshToken } = payload;
      if (!token && !refreshToken) return false;

      //
      const findToken = await this.tokenRepository.findOne({
        where: [{ token }, { refreshToken }],
      });

      //
      if (!findToken) {
        throw new UnauthorizedException(Exception.notfound('Token'));
      }

      await this.tokenRepository.save({
        ...findToken,
        isRevoked: true,
      });

      //
      return true;
    } catch (error) {
      console.log('Revoke token fail !');
      throw error;
    }
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
      const exist = await this.tokenRepository.findOneBy({ token });

      if (!exist) {
        throw new UnauthorizedException('Token not found');
      }

      if (exist.isRevoked) {
        throw new UnauthorizedException('Token revoked');
      }

      return await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRET_ACCESS_KEY,
      });
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  async verifyRefreshToken(token: string): Promise<TPayloadToken> {
    try {
      const exist = await this.tokenRepository.findOneBy({ refreshToken: token });

      if (!exist) {
        throw new UnauthorizedException('Token not found');
      }

      if (exist.isRevoked) {
        throw new UnauthorizedException('Token revoked');
      }
      return await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRET_REFRESH_KEY,
      });
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  getTimeExpired(num: number) {
    return new Date(Date.now() + num * 24 * 60 * 60 * 1000);
  }
}

// Mỗi lần đăng nhập sẽ tạo ra 1 token (access, refresh, expiresAt, expiresRefreshAt, isRevoke)
