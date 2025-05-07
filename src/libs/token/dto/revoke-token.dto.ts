import { ApiProperty } from '@nestjs/swagger';
import { IToken } from 'src/interfaces/models.interface';

export class RevokeTokenDto implements Partial<IToken> {
  @ApiProperty({ default: 'token' })
  token?: string;

  @ApiProperty({ default: 'refreshToken' })
  refreshToken?: string;
}
