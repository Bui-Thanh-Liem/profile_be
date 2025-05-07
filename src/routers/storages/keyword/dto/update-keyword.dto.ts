import { PartialType } from '@nestjs/swagger';
import { CreateKeyWordDto } from './create-keyword.dto';

export class UpdateKeyWordDto extends PartialType(CreateKeyWordDto) {}
