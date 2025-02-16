import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { GroupsModule } from './groups/groups.module';
import { TicketsModule } from './tickets/tickets.module';
import { TransactionsModule } from './transactions/transactions.module';
import * as cookieParser from 'cookie-parser';

@Module({
  imports: [ConfigModule.forRoot({
    envFilePath: ['.env.development.local', '.env.development'],
    isGlobal: true
  }), AuthModule, UsersModule, GroupsModule, TicketsModule, TransactionsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser()).forRoutes('*');
  }
}