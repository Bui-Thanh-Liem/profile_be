import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CONSTANT_TOKEN } from 'src/constants';

// - 2
@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt-auth') {
  private readonly logger = new Logger(JwtAuthStrategy.name);
  constructor() {
    super({
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) => req.cookies[CONSTANT_TOKEN.TOKEN_NAME_USER]]),
      ignoreExpiration: false,
      secretOrKey: process.env.SECRET_ACCESS_KEY,
    });
    this.logger.debug('verify token');
  }

  // đúng thì gọi và trả về thông tin user (handleRequest), thì về thẳng handleRequest
  validate(payload: any) {
    this.logger.debug('verify token valid');
    return payload; // dùng Passport thì key mặc định sẽ là user, nếu muốn thay đổi key thì dùng guard
  }
}
