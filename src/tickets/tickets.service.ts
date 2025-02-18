import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TicketsService {
    constructor(private readonly prisma: PrismaService){}

    async create(data: any){
        const ticket = await this.prisma.ticket.create({
            data: {
                ticketNumber: data.ticketNumber,
                contributions: data.contributions,
                cost: data.cost,
                lottery: data.lottery,
                user: {
                    connect: {
                        id: data.userId
                    },
                },
                group: {
                    connect: {
                        id: data.groupId
                    }
                }
            }
        })
        return ticket;
    }
}
