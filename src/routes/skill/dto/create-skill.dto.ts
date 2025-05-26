import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import Validation from 'src/message-validations/message.validation';

export class CreateSkillDto {
  @ApiProperty({ default: 'Html' })
  @IsNotEmpty({ message: Validation.empty('Name') })
  name: string;

  @ApiProperty()
  image: any;

  @ApiProperty({ default: 0 })
  progress?: number;
}
