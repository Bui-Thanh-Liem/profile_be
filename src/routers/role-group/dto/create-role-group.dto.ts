import { ApiProperty } from '@nestjs/swagger';
import { IRoleGroup } from 'src/interfaces/models.interface';

export class CreateRoleGroupDto implements Partial<IRoleGroup> {
  @ApiProperty({ default: 'roleGroup 1' })
  name: string;

  @ApiProperty({ default: 'desc roleGroup 1' })
  desc: string;

  @ApiProperty({ default: [] })
  roles?: string[];
}
