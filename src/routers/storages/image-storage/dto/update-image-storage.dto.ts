import { PartialType } from '@nestjs/mapped-types';
import { CreateImageStorageDto } from './create-image-storage.dto';

export class UpdateImageStorageDto extends PartialType(CreateImageStorageDto) {}
