import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [GroupsService, PrismaService]
})
export class GroupsModule {}
