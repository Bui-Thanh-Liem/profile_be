import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Public } from 'src/decorators/public.decorator';
import { TokenEntity } from './entities/token.entity';
import { TokenService } from './token.service';

@Public()
@Module({
  imports: [TypeOrmModule.forFeature([TokenEntity]), JwtModule],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
