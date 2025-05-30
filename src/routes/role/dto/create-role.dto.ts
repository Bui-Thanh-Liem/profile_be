import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { Enums } from 'liemdev-profile-lib';
import { IRole } from 'src/interfaces/models.interface';
import { IRoleDataResource } from 'src/interfaces/role.interface';
import Validation from 'src/message-validations/message.validation';

export class CreateRoleDto implements Partial<IRole> {
  @ApiProperty({ default: 'role 1' })
  @IsNotEmpty({ message: Validation.empty('Name role') })
  @MinLength(2, { message: Validation.minLength('Name', 2) })
  @MaxLength(20, { message: Validation.maxLength('Name', 20) })
  name: string;

  @ApiProperty({ default: '' })
  desc: string;

  @IsNotEmpty({ message: Validation.empty('Data Sources') })
  @ApiProperty({
    default: [
      {
        resource: Enums.EResources.CUSTOMER,
        actions: [Enums.EActions.CREATE],
      },
    ],
  })
  dataSources: IRoleDataResource[];
}
