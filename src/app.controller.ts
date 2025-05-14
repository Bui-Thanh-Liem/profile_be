import { Controller, Get, HttpCode, Logger, Req } from '@nestjs/common';
import { Request } from 'express';
import { AppService } from './app.service';
import { ResponseSuccess } from './classes/response.class';
import { Public } from './decorators/public.decorator';

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

  @Get('protected')
  @HttpCode(200)
  async protected(@Req() req: Request) {
    const id = req?.user ? (req?.user as { userId: string }).userId : '';
    const results = await this.appService.protected(id);
    return new ResponseSuccess('Success', results);
  }
}
