import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';
import { IKeyWord } from 'src/interfaces/models.interface';
import Validation from 'src/message-validations/message.validation';

export class CreateKeyWordDto implements Partial<IKeyWord> {
  @ApiProperty({ default: 'upload-file' })
  @IsNotEmpty({ message: Validation.empty('Label') })
  @MinLength(4, { message: 'min length 4 characters' })
  name: string;

  @ApiProperty({ default: '#04befe' })
  color: string;
}
