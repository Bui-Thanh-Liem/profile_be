import { ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import Exception from 'src/message-validations/exception.validation';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt-auth') {
  private readonly logger = new Logger(JwtAuthGuard.name);
  constructor(private reflector: Reflector) {
    super();
  }

  // được gọi trước khi request được xử lý
  canActivate(context: ExecutionContext): boolean {
    this.logger.debug('Run 2');
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());

    // cho đi qua
    if (isPublic) {
      return true;
    }

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
