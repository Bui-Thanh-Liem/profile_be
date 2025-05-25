import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { Constants } from 'liemdev-profile-lib';
import { ResponseSuccess } from 'src/classes/response.class';
import { Public } from 'src/decorators/public.decorator';
import { SendBulkMailDto } from './dto/send-bulk-mail.dto';
import { SendMailAdminDto, SendMailDto } from './dto/send-mail.dto';
import { SendMailService } from './send-mail.service';

@Controller(Constants.CONSTANT_ROUTE.MAIL.ROOT)
export class SendMailController {
  constructor(private readonly sendMailService: SendMailService) {}

  @Public()
  @Post(Constants.CONSTANT_ROUTE.MAIL.SEND_ADMIN)
  async sendAdmin(@Body() sendMailAdminDto: SendMailAdminDto) {
    const result = await this.sendMailService.sendAdmin(sendMailAdminDto);
    return new ResponseSuccess('Success', result);
  }

  @Post(Constants.CONSTANT_ROUTE.MAIL.SEND_USER)
  async sendUser(@Body() sendMailUserDto: SendMailDto, @Res() res: Response) {
    const result = await this.sendMailService.sendUser(sendMailUserDto);

    return new ResponseSuccess('Success', result);
  }

  @Post(Constants.CONSTANT_ROUTE.MAIL.SEND_CUSTOMER)
  async sendCustomer(@Body() sendMailCustomerDto: SendMailDto, @Res() res: Response) {
    const result = await this.sendMailService.sendCustomer(sendMailCustomerDto);

    return new ResponseSuccess('Success', result);
  }

  @Post(Constants.CONSTANT_ROUTE.MAIL.SEND_BULK)
  async sendBulk(@Body() sendMailBulkDto: SendBulkMailDto, @Res() res: Response) {
    const result = await this.sendMailService.sendBulk(sendMailBulkDto);

    return new ResponseSuccess('Success', result);
  }
}
