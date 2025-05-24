import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { IToken } from 'src/interfaces/models.interface';

export class RevokeTokenDto {
  @IsOptional()
  @ApiProperty({ type: Array, default: ['userIds'] })
  userIds: string[];
}

export class RevokeTokenToLogoutDto implements Partial<IToken> {
  token?: string;
  refreshToken?: string;
}
