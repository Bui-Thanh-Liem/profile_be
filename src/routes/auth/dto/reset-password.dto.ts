import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { IUser } from 'src/interfaces/models.interface';
import Validation from 'src/message-validations/message.validation';

export class ResetPasswordDto implements Partial<IUser> {
  @ApiProperty({ default: 'Admin123@' })
  @IsNotEmpty({ message: Validation.empty('Password') })
  password: string;
}
