import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private readonly authService: AuthService) {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            callbackURL: 'http://localhost:3000/auth/google/redirect',
            scope: ['email', 'profile'],
            passReqToCallback: false,
        });
    }

    async validate(
        _accessToken: string,  // <-- renamed to _accessToken
        _refreshToken: string, // <-- if unused, rename as well
        profile: any,
        done: VerifyCallback,
    ): Promise<any> {
        const { id, emails, displayName } = profile;
        const email = emails[0].value;

        const user = await this.authService.validateOAuthLogin(
            'google',
            id,
            email,
            displayName,
        );

        if (!user) {
            return done(new UnauthorizedException(), false);
        }
        return done(null, user);
    }
}
