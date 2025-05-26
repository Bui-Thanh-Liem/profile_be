import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import Validation from 'src/message-validations/message.validation';

export class ConfirmOtpDto {
  @ApiProperty({ default: '123123' })
  @IsNotEmpty({ message: Validation.empty('Otp') })
  otp: string;
}
