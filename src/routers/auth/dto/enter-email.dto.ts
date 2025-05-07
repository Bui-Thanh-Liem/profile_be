import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { IUser } from 'src/interfaces/models.interface';
import Validation from 'src/message-validations/message.validation';

export class EnterEmailDto implements Partial<IUser> {
  @ApiProperty({ default: 'buithanhliem5073@gmail.com' })
  @IsNotEmpty({ message: Validation.empty('Email') })
  @IsEmail()
  email: string;
}
