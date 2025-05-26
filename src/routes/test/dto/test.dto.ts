import { ApiProperty } from '@nestjs/swagger';

export class TestDto {
  @ApiProperty({ type: Number, default: 100 })
  quantity: number;
}
