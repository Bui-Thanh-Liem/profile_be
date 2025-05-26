import { forwardRef, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenEntity } from 'src/libs/token/entities/token.entity';
import { GoogleStrategy } from 'src/routes/customer/strategy-local/local.strategy';
import { TokenModule } from '../../libs/token/token.module';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { CustomerEntity } from './entities/customer.entity';
import { HelperModule } from 'src/helpers/helper.module';
import { QueueSmsModule } from 'src/libs/bull/queue-sms/queue-sms.module';
import { QueueMailModule } from 'src/libs/bull/queue-mail/queue-mail.module';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([CustomerEntity, TokenEntity]),
    forwardRef(() => TokenModule),
    HelperModule,
    QueueSmsModule,
    QueueMailModule,
  ],
  providers: [CustomerService, GoogleStrategy, JwtService],
  controllers: [CustomerController],
  exports: [CustomerService],
})
export class CustomerModule {}
