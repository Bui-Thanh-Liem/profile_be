import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ISubjectItem } from 'src/interfaces/models.interface';
import Validation from '../../../../message-validations/message.validation';

export class CreateSubjectItemDto implements Partial<ISubjectItem> {
  @ApiProperty()
  @IsNotEmpty({ message: Validation.empty('Name') })
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  desc: string;

  @ApiProperty()
  @IsOptional()
  code: string;

  @ApiProperty()
  @IsNotEmpty({ message: Validation.empty('Keywords') })
  keywords?: string[];

  @ApiProperty()
  image: any;
}
