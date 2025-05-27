import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JWT_SECRET } from '../configs/jwt-secret'; // Adjust the import path as necessary
import { PassportModule } from '@nestjs/passport';
import { PassportAuthController } from './passport-auth.controller'; // Adjust the import path as necessary
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController, PassportAuthController],
  imports: [
    UsersModule,
    JwtModule.register({
      secret: JWT_SECRET,
      global: true,
      signOptions: { expiresIn: '1d' }, // Token expiration time],
    }),
    PassportModule
  ],
})
export class AuthModule {}
