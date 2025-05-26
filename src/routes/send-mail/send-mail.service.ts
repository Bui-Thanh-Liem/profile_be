import { BadRequestException, Injectable } from '@nestjs/common';
import { QueueMailService } from 'src/libs/bull/queue-mail/queue-mail.service';
import { SendBulkMailDto } from './dto/send-bulk-mail.dto';
import { SendMailAdminDto, SendMailDto } from './dto/send-mail.dto';

@Injectable()
export class SendMailService {
  constructor(private queueMailService: QueueMailService) {}

  async sendAdmin(sendMailAdminDto: SendMailAdminDto) {
    // Mở rộng ứng dụng, logic trước khi gửi
    try {
      const emailAdmin = process.env.ROOT_EMAIL || '';
      return await this.queueMailService.sendMail({
        ...sendMailAdminDto,
        to: emailAdmin,
      });
    } catch (error) {
      throw new BadRequestException('Send mail fail !');
    }
  }

  async sendUser(sendMailUserDto: SendMailDto) {
    // Mở rộng ứng dụng, logic trước khi gửi
    try {
      return await this.queueMailService.sendMail(sendMailUserDto);
    } catch (error) {
      throw new BadRequestException('Send mail fail !');
    }
  }

  async sendCustomer(sendMailCustomerDto: SendMailDto) {
    // Mở rộng ứng dụng, logic trước khi gửi
    try {
      return await this.queueMailService.sendMail(sendMailCustomerDto);
    } catch (error) {
      throw new BadRequestException('Send mail fail !');
    }
  }

  async sendBulk(sendMailCustomerDto: SendBulkMailDto) {
    // Mở rộng ứng dụng, logic trước khi gửi
    try {
      return await this.queueMailService.sendBulkMail(sendMailCustomerDto);
    } catch (error) {
      throw new BadRequestException('Send bulk mail fail !');
    }
  }
}
