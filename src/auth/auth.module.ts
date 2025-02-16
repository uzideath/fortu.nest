import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports:
    [
      PassportModule.register({ defaultStrategy: 'jwt' }),
      JwtModule.register({
        secret: 'test',
        signOptions: { expiresIn: '1d' },
      }), UsersModule
    ],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule { }
