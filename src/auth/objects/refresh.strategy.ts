import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
    Strategy,
    'jwt-refresh',
) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
            secretOrKey: process.env.JWT_REFRESH_SECRET || 'REFRESH_SECRET',
            passReqToCallback: true,
        });
    }

    async validate(req: Request, payload: any) {
        const refreshToken = req.body.refreshToken;
        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token not provided');
        }
        // if needed, use AuthService to verify in DB
        return { userId: payload.sub, refreshToken };
    }
}
