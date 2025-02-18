import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GroupsService {
    constructor(private readonly prisma: PrismaService){}

    async create(data:any){
        await this.prisma.group.create({
            data: {
                name: data.name,
            }
        })
    }
}
