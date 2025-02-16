import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';
import { IsDecimal } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
export class CreateUserDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsEnum(Role)
    @IsOptional()
    role?: Role;

    @IsDecimal()
    @IsOptional()
    balance?: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) { }
