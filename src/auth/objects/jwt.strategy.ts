import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';
import { User } from '@prisma/client';
import { JwtPayload } from '../types/jwt.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private usersService: UsersService) {
        super({
            // Use header-based Bearer token
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'YOUR_SECRET_HERE',
        });
    }

    async validate(payload: JwtPayload): Promise<User> {
        // We expect payload = { sub: userId, email: userEmail } from AuthService
        const user = await this.usersService.findById(payload.sub);

        if (!user) {
            throw new UnauthorizedException('You are not authorized to access.');
        }

        return user;
    }
}
