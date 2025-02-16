import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { Service } from 'src/lib/service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService extends Service {
    constructor(private readonly prisma: PrismaService) {
        super(UsersService.name);
    }

    async findOneByEmail(email: string): Promise<User> {
        const user = await this.prisma.user.findUnique({
            where: { email }
        });

        if (user)
            return user;
        else throw new NotFoundException(`No user found with the email ${email}.`)
    }

    async findById(id: number): Promise<User> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (user)
            return user;
        else throw new NotFoundException()
    }
}
