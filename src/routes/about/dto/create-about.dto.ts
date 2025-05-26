import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import Validation from 'src/message-validations/message.validation';
import { aboutData } from '../initial-data';

export class CreateAboutDto {
  @ApiProperty({
    default: aboutData.text,
  })
  @IsNotEmpty({ message: Validation.empty('text') })
  text: string[];

  @ApiProperty({ default: aboutData.email })
  @IsNotEmpty({ message: Validation.empty('email') })
  email: string;

  @ApiProperty({ type: 'string', default: aboutData.phone })
  @IsNotEmpty({ message: Validation.empty('phone') })
  phone: string;

  @ApiProperty({
    type: 'string',
    default: aboutData.address,
  })
  @IsNotEmpty({ message: Validation.empty('address') })
  address: string;

  @ApiProperty()
  image: any;
}
