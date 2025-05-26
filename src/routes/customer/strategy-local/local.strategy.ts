import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Constants } from 'liemdev-profile-lib';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ICustomer } from 'src/interfaces/models.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_HOST}/api/v1/${Constants.CONSTANT_ROUTE.CUSTOMER}/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    console.log('profile customer:::', profile);

    const { name, emails, photos } = profile;
    const customer: Partial<ICustomer> = {
      email: emails[0].value,
      fullName: name.givenName + ' ' + name.familyName,
      avatar: photos[0].value,
      accessToken,
      refreshToken,
    };

    done(null, customer); // headers:{user: customer}
  }
}
