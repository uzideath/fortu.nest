import { IsDecimal, IsEnum, IsInt } from 'class-validator';
import { TransactionType } from '@prisma/client';
import { PartialType } from '@nestjs/mapped-types';

export class CreateTransactionDto {
    @IsDecimal()
    amount: string; // decimal as string

    @IsEnum(TransactionType)
    transactionType: TransactionType;

    @IsInt()
    userId: number;

    @IsInt()
    ticketId?: number;
}

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {}