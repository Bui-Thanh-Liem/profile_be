import { PartialType } from '@nestjs/swagger';
import { CreateRoleGroupDto } from './create-role-group.dto';

export class UpdateRoleGroupDto extends PartialType(CreateRoleGroupDto) {}
