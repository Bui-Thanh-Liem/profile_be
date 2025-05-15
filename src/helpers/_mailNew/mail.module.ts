import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { join } from 'path';
import { CONSTANT_ENV } from 'src/constants';
import { MailNewService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: process.env.NODE_ENV === CONSTANT_ENV.NODE_ENV.PROD,
        auth: {
          user: process.env.ROOT_EMAIL, // Email của bạn
          pass: process.env.ROOT_EMAIL_PASSWORD, // Mật khẩu ứng dụng (App Password)
        },
      },
      defaults: {
        from: '"LiemDev 👻" <no-reply@gmail.com>', // Email gửi đi
      },
      template: {
        dir: join(__dirname, '..', '..', 'templates'), // Thư mục chứa file template `.hbs`
        adapter: new HandlebarsAdapter(),
        options: { strict: true },
      },
    }),
  ],
  providers: [MailNewService],
  exports: [MailNewService],
})
export class MailNewModule {}
