import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { IUser } from 'src/interfaces/models.interface';
import Validation from 'src/message-validations/message.validation';

export class LoginAuthDto implements Partial<IUser> {
  @ApiProperty({ default: 'buithanhliem5073@gmail.com' })
  @IsNotEmpty({ message: Validation.empty('Email') })
  @IsEmail()
  email: string;

  @ApiProperty({ default: 'Liemdev123@' })
  @IsNotEmpty({ message: Validation.empty('Password') })
  password: string;
}
