import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrincipalService } from '../../common/auth/principal.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { TokenService } from './token.service';

@Global()
@Module({
  // Secrets are passed per call (access vs refresh) from AppConfigService.
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, TokenService, OtpService, PrincipalService],
  exports: [AuthService, TokenService, PrincipalService, JwtModule],
})
export class AuthModule {}
