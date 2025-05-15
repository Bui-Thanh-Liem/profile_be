import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Enums } from 'liemdev-profile-lib';
import { ISendMail } from 'src/interfaces/common.interface';
import Validation from 'src/message-validations/message.validation';

export class SendMailAdminDto implements ISendMail {
  @ApiProperty({ default: 'This is api send mail to admin/user/customer' })
  @IsNotEmpty({ message: Validation.empty('subject') })
  subject: string;

  @ApiProperty({
    default: `<h1>Hi, admin/user/customer</h1>
                <p>I'am {{name}}</p>`,
  })
  source?: string;

  @ApiProperty({
    default: {
      name: Enums.ETypeMail.FORM_LOGOUT,
    },
  })
  @IsNotEmpty({ message: Validation.empty('type') })
  type: Enums.ETypeMail;
}

export class SendMailDto extends SendMailAdminDto {
  @ApiProperty({ default: 'buithanhliem5073@gmail.com' })
  @IsNotEmpty({ message: Validation.empty('to') })
  to: string;

  @ApiProperty({
    default: 'nameFile in template folder',
  })
  templateName: string;

  @ApiProperty({
    default: {
      name: 'LiemDev',
    },
  })
  @IsNotEmpty({ message: Validation.empty('content') })
  variables: any;
}
