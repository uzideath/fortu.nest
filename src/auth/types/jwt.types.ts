import { IsInt, IsOptional, IsString } from 'class-validator';

export interface JwtPayload {
    sub: number;    // usually the user id
    email: string;
    iat?: number;   // issued at
    exp?: number;   // expiration time
}

export class RefreshTokenDto {
    @IsString()
    refreshToken: string;
}

export class RevokeTokenDto {
    @IsInt()
    tokenId: number;

    @IsInt()
    @IsOptional()
    userId?: number;
}