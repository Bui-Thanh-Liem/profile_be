import { ApiProperty } from '@nestjs/swagger';
import { IToken, IUser } from 'src/interfaces/models.interface';

export class SignTokenDto implements Partial<IToken> {
  @ApiProperty({ default: {} })
  user: Omit<IUser, 'password'>;

  @ApiProperty({ default: 'device-info' })
  deviceInfo: string;

  @ApiProperty({ default: 'ip-address' })
  ipAddress: string;
}
