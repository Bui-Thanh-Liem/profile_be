import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueMailModule } from 'src/libs/bull/queue-mail/queue-mail.module';
import { TokenEntity } from '../../libs/token/entities/token.entity';
import { TokenModule } from '../../libs/token/token.module';
import { UserEntity } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategy-local/local.strategy';
import { HelperModule } from 'src/helpers/helper.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, TokenEntity]),
    PassportModule, // strategy local
    TokenModule,
    UserModule,
    HelperModule,
    QueueMailModule,
  ],
  providers: [AuthService, LocalStrategy, JwtService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
