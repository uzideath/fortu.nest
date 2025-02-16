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

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Req() req: Request, @Res() res: Response) {
        // Local strategy sets user in req.user if valid
        const user = req.user as User;  // <-- type cast
        if (!user) {
            // handle the case where user is undefined
            return res.status(401).json({ message: 'No user found in request' });
        }
        return this.authService.login(user, res);
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
