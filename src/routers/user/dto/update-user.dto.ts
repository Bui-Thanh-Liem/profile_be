import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IUser } from 'src/interfaces/models.interface';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) implements Partial<IUser> {
  @ApiProperty({ default: '' })
  avatar: string;

  @ApiProperty({ default: false })
  isAdmin: boolean;

  @ApiProperty({ default: false })
  block: boolean;

  @ApiProperty({ default: false })
  status: boolean;
}
