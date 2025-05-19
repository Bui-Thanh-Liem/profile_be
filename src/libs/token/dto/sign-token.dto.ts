import { ApiProperty } from '@nestjs/swagger';
import { ICustomer, IToken, IUser } from 'src/interfaces/models.interface';

export class SignTokenDto implements Partial<IToken> {
  user?: Omit<IUser, 'password'>;
  customer?: Omit<ICustomer, 'password'>;
  deviceInfo: string;
  ipAddress: string;
}
