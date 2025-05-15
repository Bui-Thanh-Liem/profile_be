import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import Validation from 'src/message-validations/message.validation';

export class VerifyOtpDto {
  @ApiProperty({ default: '123123' })
  @IsNotEmpty({ message: Validation.empty('Otp') })
  @IsString()
  @MinLength(6, { message: Validation.minLength('Otp', 6) })
  code: string;

  @ApiProperty({ default: 'buithanhliem5073@gmail.com' })
  @IsEmail()
  email: string;

  @Optional()
  @ApiProperty({ default: '0922902163' })
  phone: string;
}
