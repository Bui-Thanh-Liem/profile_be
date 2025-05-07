import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { Enums } from 'liemdev-profile-lib';
import { IRole } from 'src/interfaces/models.interface';
import { IRoleDataResource } from 'src/interfaces/role.interface';
import Validation from 'src/message-validations/message.validation';

export class CreateRoleDto implements Partial<IRole> {
  @ApiProperty({ default: 'role 1' })
  @IsNotEmpty({ message: Validation.empty('Name role') })
  @MinLength(2, { message: Validation.minLength('name', 2) })
  @MaxLength(20, { message: Validation.maxLength('name', 20) })
  name: string;

  @ApiProperty({ default: '' })
  desc: string;

  @ApiProperty({
    default: [
      {
        resource: Enums.ERoleResources.FILE,
        actions: [Enums.ERoleActions.CREATE],
      },
    ],
  })
  dataSources?: IRoleDataResource[];
}
