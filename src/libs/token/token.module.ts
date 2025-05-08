import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../../routers/user/user.module';
import { TokenEntity } from './entities/token.entity';
import { TokenService } from './token.service';
import { JwtModule } from '@nestjs/jwt';
import { Public } from 'src/decorators/public.decorator';
import { CustomerModule } from 'src/routers/customer/customer.module';

@Public()
@Module({
  imports: [TypeOrmModule.forFeature([TokenEntity]), UserModule, JwtModule, forwardRef(() => CustomerModule)],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
