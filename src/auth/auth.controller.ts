import {
    Controller,
    Post,
    Req,
    Res,
    UseGuards,
    Get,
    Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { User } from '@prisma/client';
import { RegisterDto } from './types/register.types';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        const newUser = await this.authService.register(registerDto);
        return {
            message: 'User registered successfully',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
            },
        };
    }

    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Req() req, @Res() res: Response) {
        const user = req.user as User;
        // This calls AuthService.login() which sets cookies
        await this.authService.login(user, res);

        // Then explicitly send JSON (or any response) 
        // so the request ends properly
        return res.json({ message: 'Login successful' });
    }

    @Post('refresh')
    async refresh(@Req() req: Request, @Res() res: Response) {
        const refreshToken = req.cookies?.Refresh;
        const accessToken = req.cookies?.Authentication;
        if (!refreshToken) {
            return res.status(403).json({ message: 'No refresh token provided' });
        }

        // decode or verify the refresh token to extract user info
        try {
            const payload = await this.authService['jwtService'].verifyAsync(
                refreshToken,
                {
                    secret: process.env.JWT_REFRESH_SECRET || 'REFRESH_SECRET',
                },
            );
            const userId = payload.sub;
            await this.authService.refreshTokens(userId, refreshToken, res);
            return res.send({ message: 'Token refreshed' });
        } catch (err) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }
    }

    @Post('logout')
    async logout(@Req() req: Request, @Res() res: Response) {
        // if you keep userId in the access token or store in session
        let userId = null;
        try {
            const at = req.cookies?.Authentication;
            const payload = await this.authService['jwtService'].verifyAsync(at, {
                secret: process.env.JWT_ACCESS_SECRET || 'ACCESS_SECRET',
            });
            userId = payload.sub;
        } catch (error) {
            // if it fails, we might rely on a different approach
            // or we can decide user must be valid to "logout"
        }

        if (!userId) {
            // fallback: you may just clear cookies
            res.clearCookie('Authentication');
            res.clearCookie('Refresh');
            return res.json({ message: 'Logged out' });
        }

        // Revoke tokens in DB
        await this.authService.logout(userId, res);
        return res.json({ message: 'Logged out' });
    }

    // Example protected route
    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    getProfile(@Req() req: Request) {
        return req.user;
    }
}
