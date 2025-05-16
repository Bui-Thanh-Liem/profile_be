import { BadRequestException, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import { CONSTANT_ENV } from 'src/constants';
import { ISendMail } from 'src/interfaces/common.interface';
import { UtilArray } from 'src/utils/Array.util';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: process.env.NODE_ENV === CONSTANT_ENV.NODE_ENV.PROD,
    service: 'gmail',
    auth: {
      user: process.env.ROOT_EMAIL,
      pass: process.env.ROOT_EMAIL_PASSWORD,
    },
  });

  async sendMail({ subject, templateName, to, variables, source, type }: ISendMail) {
    try {
      if (!process.env.ROOT_EMAIL || !process.env.ROOT_EMAIL_PASSWORD) {
        throw new BadRequestException('Error send email');
      }

      let _source = source || '';

      //
      if (templateName) {
        const templatePath = path.join(__dirname, '..', '..', 'templates', `${templateName}.hbs`);
        _source = fs.readFileSync(templatePath, 'utf8');
      }

      // Compile template với handlebars
      const compiledTemplate = handlebars.compile(_source);
      const htmlToSend = compiledTemplate(variables);

      const res = await this.transporter.sendMail({
        from: process.env.ROOT_EMAIL,
        to,
        subject: `${subject} -> ${type}`,
        html: htmlToSend,
      });

      return true;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async sendBulkMails({ subject, templateName, toBulk, variables, type, source }: ISendMail) {
    const batchSize = 5;
    const recipientChunks = UtilArray.chunkArray(toBulk, batchSize); // [ 5items, 5items]

    //
    for (const chunk of recipientChunks) {
      await Promise.all(
        chunk.map((mail) =>
          this.sendMail({
            to: mail,
            subject,
            source,
            templateName,
            type,
            variables,
          }),
        ),
      );
    }

    return true;
  }
}
