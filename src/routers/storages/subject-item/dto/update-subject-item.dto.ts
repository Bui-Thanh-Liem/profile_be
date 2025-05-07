import { PartialType } from '@nestjs/swagger';
import { CreateSubjectItemDto } from './create-subject-item.dto';

export class UpdateSubjectItemDto extends PartialType(CreateSubjectItemDto) {}
