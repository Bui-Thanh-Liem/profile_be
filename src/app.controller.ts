import { Controller, Get, HttpCode, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { ResponseSuccess } from './classes/response.class';
import { ActiveCustomer } from './decorators/activeCustomer.decorator';
import { ActiveUser } from './decorators/activeUser.decorator';
import { Customer } from './decorators/customer.decorator';
import { Public } from './decorators/public.decorator';
import { TPayloadToken } from './types/TPayloadToken.type';

@Controller('')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);
  constructor(private appService: AppService) {}

  @Get('health')
  @Public()
  @HttpCode(200)
  check() {
    return new ResponseSuccess('Success', { message: 'health - ok' });
  }

  @Get('protected-user')
  @HttpCode(200)
  async protectedUser(@ActiveUser() { userId }: TPayloadToken) {
    const results = await this.appService.protectedUser(userId);
    return new ResponseSuccess('Success', results);
  }

  @Customer()
  @Get('protected-customer')
  @HttpCode(200)
  async protectedCustomer(@ActiveCustomer() { customerId }: TPayloadToken) {
    const results = await this.appService.protectedCustomer(customerId);
    return new ResponseSuccess('Success', results);
  }
}
