import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { ILike } from 'src/interfaces/models.interface';
import Validation from 'src/message-validations/message.validation';

export class CreateLikeDto implements Partial<ILike> {
  @ApiProperty({ default: 'knowledge-id' })
  @IsNotEmpty({ message: Validation.empty('knowledgeId') })
  @IsUUID('4', { message: 'KnowledgeId required uuid' })
  knowledgeId?: string;

  @ApiProperty({ default: 'customer-id' })
  @IsNotEmpty({ message: Validation.empty('customerId') })
  @IsUUID('4', { message: 'CustomerId required uuid' })
  customerId?: string;
}
