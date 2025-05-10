import { Controller, Get, HttpCode, Logger } from '@nestjs/common';
import { ResponseSuccess } from './classes/response.class';
import { Public } from './decorators/public.decorator';

@Controller('')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  @Get('health')
  @Public()
  @HttpCode(200)
  check() {
    return new ResponseSuccess('Success', { message: 'health - ok' });
  }

  @Get('protected')
  @HttpCode(200)
  protected() {
    return new ResponseSuccess('Success', { message: 'protected - ok' });
  }
}
