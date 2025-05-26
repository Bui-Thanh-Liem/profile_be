import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Enums } from 'liemdev-profile-lib';
import { INote } from 'src/interfaces/models.interface';
import Validation from 'src/message-validations/message.validation';

export class CreateNoteDto implements Partial<INote> {
  @ApiProperty({ default: 'Event 1' })
  @IsNotEmpty({ message: Validation.empty('Title') })
  title: string;

  @ApiProperty({ default: '' })
  desc: string;

  @ApiProperty({ default: '#04befe' })
  color?: string;

  @ApiProperty({ default: new Date() })
  date?: Date;

  @ApiProperty({ default: Enums.EStatus.PROCESSING })
  status?: Enums.EStatus;
}
