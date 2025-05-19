import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Enums } from 'liemdev-profile-lib';
import { Match } from 'src/decorators/match.decorator';
import { IUser } from 'src/interfaces/models.interface';
import Validation from 'src/message-validations/message.validation';

export class CreateUserDto implements Partial<IUser> {
  @ApiProperty({ default: 'LiemDev' })
  @IsNotEmpty({ message: Validation.empty('Fullname') })
  @IsString()
  @MinLength(2, { message: Validation.minLength('fullName', 2) })
  @MaxLength(20, { message: Validation.maxLength('fullName', 20) })
  fullName: string;

  @ApiProperty({ default: 'buithanhliem5073@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ default: '1231231231' })
  @MinLength(2, { message: Validation.minLength('phone', 10) })
  @MaxLength(20, { message: Validation.maxLength('phone', 11) })
  @IsString()
  phone: string;

  @ApiProperty({ default: Enums.EGender.MALE })
  @IsNotEmpty({ message: Validation.empty('Gender') })
  gender: Enums.EGender;

  @ApiProperty({ default: false })
  @IsBoolean()
  isSubAdmin: boolean;

  @ApiProperty({ default: 'Admin123@' })
  @IsNotEmpty({ message: Validation.empty('Password') })
  password: string;

  @ApiProperty({ default: 'Admin123@' })
  @Match('password', {
    message: 'Passwords do not match',
  })
  passwordConfirm?: string;

  @ApiProperty({ default: [] })
  @IsArray()
  roles?: string[];

  @ApiProperty({ default: [] })
  @IsArray()
  roleGroups?: string[];
}
