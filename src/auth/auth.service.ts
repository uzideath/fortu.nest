import {
    Injectable,
    UnauthorizedException,
    ForbiddenException,
    ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './types/register.types';
import { Response } from 'express';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
    ) { }

    /**
     * Validate user credentials for local strategy.
     */
    async validateUser(email: string, password: string): Promise<User> {
        const user = await this.usersService.findOneByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return user;
    }

    async register(registerDto: RegisterDto): Promise<User> {
        // 1. Check if user with this email already exists
        const existing = await this.prisma.user.findUnique({
            where: { email: registerDto.email },
        });
        if (existing) {
            throw new ConflictException('Email is already in use');
        }

        // 2. Hash the password
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        // 3. Create the user in DB
        const newUser = await this.prisma.user.create({
            data: {
                name: registerDto.name,
                email: registerDto.email,
                password: hashedPassword,
            },
        });

        return newUser;
    }

    /**
     * After successful login (LocalStrategy), issue tokens.
     * Set them as secure, httpOnly cookies in the response.
     */
    async login(user: User, response: Response) {
        const tokens = await this.getTokens(user.id, user.email);
        await this.saveRefreshToken(user.id, tokens.refreshToken);

        response.cookie('Authentication', tokens.accessToken, {
            httpOnly: true,
            maxAge: 15 * 60 * 1000,
            // secure: true if in production with HTTPS
        });
        response.cookie('Refresh', tokens.refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // NOTE: do NOT return an object here if you're using @Res(),
        // because Nest won't handle that automatically.
        // We'll finalize the response in the controller:
    }


    /**
     * Refresh endpoint. Validate the refresh cookie, then rotate.
     */
    async refreshTokens(userId: number, refreshToken: string, response: any) {
        const refreshRecord = await this.prisma.refreshToken.findFirst({
            where: {
                userId,
                isRevoked: false,
            },
            orderBy: {
                createdAt: 'desc', // we can choose to handle most recent token or all
            },
        });

        if (!refreshRecord) {
            throw new UnauthorizedException('No valid refresh session found.');
        }

        // Compare provided token with the hashed one in DB
        const isValid = await bcrypt.compare(refreshToken, refreshRecord.hashedToken);
        if (!isValid) {
            throw new ForbiddenException('Refresh token is invalid.');
        }

        // Check expiry
        if (new Date() > refreshRecord.expiresAt) {
            throw new UnauthorizedException('Refresh token has expired.');
        }

        // ROTATION: revoke old token
        await this.prisma.refreshToken.update({
            where: { id: refreshRecord.id },
            data: { isRevoked: true },
        });

        // Issue new tokens
        const user = await this.usersService.findById(userId);
        const tokens = await this.getTokens(user.id, user.email);

        // Save new refresh token
        await this.saveRefreshToken(user.id, tokens.refreshToken);

        // Update cookies
        response.cookie('Authentication', tokens.accessToken, {
            httpOnly: true,
            secure: false,
            maxAge: 15 * 60 * 1000,
        });
        response.cookie('Refresh', tokens.refreshToken, {
            httpOnly: true,
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return { message: 'Tokens refreshed' };
    }

    /**
     * Logout: Revoke all refresh tokens for user (or just the active ones),
     * and clear cookies from the response.
     */
    async logout(userId: number, response: any) {
        await this.prisma.refreshToken.updateMany({
            where: { userId, isRevoked: false },
            data: { isRevoked: true },
        });
        // Clear the cookies
        response.clearCookie('Authentication');
        response.clearCookie('Refresh');
        return { message: 'Logged out' };
    }

    /**
     * Helper to generate both Access & Refresh token
     */
    private async getTokens(userId: number, email: string) {
        const payload = { sub: userId, email };

        // Access token
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_ACCESS_SECRET || 'ACCESS_SECRET',
            expiresIn: '15m',
        });

        // Refresh token
        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_REFRESH_SECRET || 'REFRESH_SECRET',
            expiresIn: '7d',
        });

        return { accessToken, refreshToken };
    }

    /**
     * Store a hashed version of the refresh token in DB
     */
    private async saveRefreshToken(userId: number, token: string) {
        const hashedToken = await bcrypt.hash(token, 10);

        await this.prisma.refreshToken.create({
            data: {
                userId,
                hashedToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
    }
    async validateOAuthLogin(
        provider: string,
        providerId: string,
        email: string,
        displayName: string,
    ): Promise<User> {
        // 1. Check if there's an existing OAuthAccount record
        let oauthAccount = await this.prisma.oAuthAccount.findUnique({
            where: { provider_providerId: { provider, providerId } },
            include: { user: true },
        });

        if (!oauthAccount) {
            // 2. If not found, check if there's a User with this email
            //    or create a new user
            let user = await this.prisma.user.findUnique({ where: { email } });
            if (!user) {
                user = await this.prisma.user.create({
                    data: {
                        email,
                        name: displayName,
                        // if you want a random password or something
                        password: '',
                    },
                });
            }

            // 3. Create the OAuthAccount
            oauthAccount = await this.prisma.oAuthAccount.create({
                data: {
                    provider,
                    providerId,
                    userId: user.id,
                    // you can store raw data in providerData if you want
                    providerData: {},
                },
                include: { user: true },
            });
        }

        return oauthAccount.user;
    }

}
