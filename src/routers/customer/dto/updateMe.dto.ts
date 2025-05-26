import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { ICustomer } from 'src/interfaces/models.interface';

export class UpdateMeOtpDto implements Partial<ICustomer> {
  @IsOptional()
  @ApiProperty({ default: 'Customer 1' })
  fullName: string;

  @IsOptional()
  @ApiProperty({ default: 'https://url.png' })
  avatar: string;

  @IsOptional()
  @ApiProperty({ default: 'customer1@gmail.com' })
  email: string;

  @IsOptional()
  @ApiProperty({ default: 'password' })
  password?: string;

  @IsOptional()
  @ApiProperty({ default: '22/12/2000' })
  birthday?: string;

  @IsOptional()
  @ApiProperty({ default: false })
  block: boolean;

  @IsOptional()
  @ApiProperty({ default: '0922902163' })
  phone: string;
}
