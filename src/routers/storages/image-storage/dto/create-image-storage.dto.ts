import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { IImageStorage } from 'src/interfaces/models.interface';
import Validation from 'src/message-validations/message.validation';

export class CreateImageStorageDto implements Partial<IImageStorage> {
  @ApiProperty({ default: 'Khi upload file truoc het chung ta can tim file' })
  @IsNotEmpty({ message: Validation.empty('Label') })
  label: string;

  @ApiProperty({
    default: 'Khi upload file truoc het chung ta can tim file lala...',
  })
  desc: string;

  @ApiProperty({ default: ['Upload file'] })
  @IsNotEmpty({ message: Validation.empty('Keywords') })
  keywords: string[];

  @ApiProperty()
  images: any;
}

// Swagger cùi bắp không xử lý được array trong form-data
// const keywordsArray =
// typeof keywords === 'string'
//   ? (keywords as string).split(',').map((k) => k.trim())
//   : keywords || [];
