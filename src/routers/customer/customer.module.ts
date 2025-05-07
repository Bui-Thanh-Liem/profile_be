import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from 'src/strategies/google.strategy';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';

@Module({
  imports: [PassportModule],
  controllers: [CustomerController],
  providers: [CustomerService, GoogleStrategy],
})
export class CustomerModule {}
