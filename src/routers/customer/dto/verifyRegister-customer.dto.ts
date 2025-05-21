import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Match } from 'src/decorators/match.decorator';
import { ICustomer } from 'src/interfaces/models.interface';
import Validation from 'src/message-validations/message.validation';

export class VerifyRegisterDto implements Partial<ICustomer> {
  @ApiProperty({ default: 'LiemDev' })
  @IsNotEmpty({ message: Validation.empty('Fullname') })
  @IsString()
  @MinLength(2, { message: Validation.minLength('fullName', 2) })
  @MaxLength(20, { message: Validation.maxLength('fullName', 20) })
  fullName: string;

  @ApiProperty({ default: 'buithanhliem5073@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ default: '0922902163' })
  @MinLength(2, { message: Validation.minLength('phone', 10) })
  @MaxLength(20, { message: Validation.maxLength('phone', 11) })
  @IsString()
  phone: string;

  @ApiProperty({ default: 'customer123@' })
  @IsNotEmpty({ message: Validation.empty('Password') })
  password: string;

  @Optional()
  @ApiProperty({ default: 'customer123@' })
  @Match('password', {
    message: 'Passwords do not match',
  })
  passwordConfirm: string;
}
