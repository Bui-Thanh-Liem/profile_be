import { Controller, Get, HttpCode, Logger } from '@nestjs/common';
import { Public } from './decorators/public.decorator';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  @Get()
  @Public()
  @HttpCode(200)
  check() {
    return { message: 'health - ok' };
  }
}
