import { ApiProperty } from '@nestjs/swagger';

export class BlockUserDto {
  @ApiProperty({ default: '' })
  id: string;
}
