import { IsString, IsOptional, IsObject, IsInt } from "class-validator";

export class CreateOAuthAccountDto {
    @IsString()
    provider: string;

    @IsString()
    providerId: string;

    @IsOptional()
    @IsObject()
    providerData?: Record<string, any>;

    @IsInt()
    userId: number;
}