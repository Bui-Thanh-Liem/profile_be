import { Controller, Get, HttpCode, Logger } from '@nestjs/common';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  @Get()
  @HttpCode(200)
  check() {
    this.logger.warn('warn');
    this.logger.debug('debug');
    this.logger.error('error');
    return { message: 'health - ok' };
  }
}
