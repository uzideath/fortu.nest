import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { User } from '@prisma/client';
import { AuthService } from '../auth.service';
import { LoginDto } from '../types/login.types';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        // by default, Passport looks for 'username', but you can change this.
        // e.g., to use email you can do:
        super({ usernameField: 'email' });
    }

    // local.strategy.ts
    async validate(email: string, password: string): Promise<User> {
        const user = await this.authService.validateUser(email, password);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }

}
