import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { IKeyWord } from 'src/interfaces/models.interface';
import Validation from 'src/message-validations/message.validation';

export class CreateKeyWordDto implements Partial<IKeyWord> {
  @ApiProperty({ default: 'upload-file' })
  @IsNotEmpty({ message: Validation.empty('Label') })
  name: string;

  @ApiProperty({ default: '#04befe' })
  color: string;
}
