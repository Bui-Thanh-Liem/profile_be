import { ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { CONSTANT_TOKEN } from 'src/constants';
import { TokenService } from 'src/libs/token/token.service';
import Exception from 'src/message-validations/exception.validation';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt-auth') {
  private readonly logger = new Logger(JwtAuthGuard.name);
  constructor(
    private reflector: Reflector,
    private tokenService: TokenService,
  ) {
    super();
  }

  // được gọi trước khi request được xử lý
  canActivate(context: ExecutionContext): boolean {
    this.logger.debug('Run 2');
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());
    const isCustomer = this.reflector.get<boolean>('isCustomer', context.getHandler());

    // cho đi qua
    if (isPublic) {
      this.logger.debug('Public route detected');
      return true;
    }

    // Xác thực thủ công từ cookie cho customer, lấy token từ request.cookies và jwtService.verify()
    this.logger.debug(`isCustomer:::, ${isCustomer}`);
    if (isCustomer) {
      this.logger.debug('Customer route detected');
      const request = context.switchToHttp().getRequest<Request>();
      const tokenCustomer = request.cookies[CONSTANT_TOKEN.TOKEN_NAME_CUSTOMER]; // Lấy token từ cookie

      if (!tokenCustomer) {
        throw new UnauthorizedException('No token provided');
      }

      //
      this.tokenService
        .verifyAccessToken(tokenCustomer)
        .then((decoded) => {
          request['customer'] = decoded;
        })
        .catch((error) => {
          throw new UnauthorizedException('Invalid or expired token');
        });
      return true;
    }

    // 1.Xác thực theo strategy jwt-auth (Passport) cho phần mặc định
    // chuyển tới xử lý strategy
    return super.canActivate(context) as boolean;
  }

  //
  handleRequest<TUser = any>(err: any, user: any, info: any, context: ExecutionContext, status?: any): TUser {
    this.logger.debug('verify token invalid');
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    if (err || !user) {
      if (info?.name === 'TokenExpiredError') {
        this.logger.debug(info);
        // Trả về lỗi 401 và message token hết hạn để Client biết, thực hiện thao tác refresh token
        throw new UnauthorizedException(Exception.expiredToken());
      }

      // if (info?.name === 'JsonWebTokenError') {
      //   throw new UnauthorizedException(Exception.invalidToken());
      // }

      throw new UnauthorizedException(Exception.invalidToken());
    }
    return user;
  }
}
