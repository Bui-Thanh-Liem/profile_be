import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { InterfaceCommon } from 'liemdev-profile-lib';

export default abstract class AQueries<T> implements InterfaceCommon.IQueries<T> {
  @ApiProperty({ default: '20' })
  limit: string;

  @ApiProperty({ default: '1' })
  page: string;

  @ApiProperty({ type: 'string', required: false })
  @Optional()
  fieldUnused?: keyof T;

  @ApiProperty({ required: false })
  @Optional()
  search?: string;

  @ApiProperty({ required: false })
  @Optional()
  token?: string;

  @ApiProperty()
  @Optional()
  filters?: { [key in keyof T]: string };

  @ApiProperty({ required: false })
  @Optional()
  fromDate?: string;

  @ApiProperty({ required: false })
  @Optional()
  toDate?: string;

  @ApiProperty({ type: String, required: false })
  @Optional()
  sortBy?: keyof T;

  @ApiProperty({ type: String, default: 'ASC' })
  @Optional()
  sortOrder?: 'ASC' | 'DESC';
}
