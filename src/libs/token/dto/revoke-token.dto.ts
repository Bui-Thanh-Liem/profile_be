import { IToken } from 'src/interfaces/models.interface';

export class RevokeTokenDto implements Partial<IToken> {
  token?: string;
  refreshToken?: string;
}
