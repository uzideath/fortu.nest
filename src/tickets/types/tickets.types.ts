import { IsDecimal, IsInt, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateTicketDto {
    @IsString()
    ticketNumber: string;

    @IsDecimal()
    cost: string;

    @IsInt()
    lotteryId: number;

    @IsInt()
    @IsOptional()
    userId?: number;

    @IsInt()
    @IsOptional()
    groupId?: number;

    @IsDecimal()
    @IsOptional()
    winningAmount?: string;
}

export class UpdateTicketDto extends PartialType(CreateTicketDto) { }

export class CreateTicketContributionDto {
    @IsInt()
    userId: number;

    @IsInt()
    ticketId: number;

    @IsDecimal()
    amountContributed: string;
}

export class UpdateTicketContributionDto extends PartialType(CreateTicketContributionDto) { }