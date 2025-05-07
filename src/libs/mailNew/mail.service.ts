import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { IVariableTemplateOtp } from 'src/interfaces/template.interface';

@Injectable()
export class MailNewService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmailOtp({
    to,
    subject,
    template,
    context,
  }: {
    to: string;
    subject?: string;
    template: string;
    context: IVariableTemplateOtp;
  }) {
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        template, // Tên file `.hbs` trong thư mục templates
        context, // Dữ liệu truyền vào template
      });
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }
}

// await this.mailService.sendEmail('user@gmail.com', 'Xác nhận đăng ký', 'otp', {
//   otpCode: '123456',
//   fullname: 'Nguyễn Văn A',
// });
