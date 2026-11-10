import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ReqMeta } from '../../common/decorators/request-meta.decorator';
import type { RequestMeta, RequestUser } from '../../common/auth/request-user';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  LogoutDto,
  RefreshDto,
  RegisterDto,
  ResendVerificationDto,
  ResetPasswordDto,
  VerifyDto,
} from './dto/auth.dto';

/** Tight limits on credential endpoints to slow down brute force and enumeration. */
const STRICT = { default: { limit: 10, ttl: 60_000 } };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @Public()
  @Throttle(STRICT)
  @ApiOperation({ summary: 'Create a member account and start a session' })
  register(@Body() dto: RegisterDto, @ReqMeta() meta: RequestMeta) {
    return this.auth.register(dto, meta);
  }

  @Post('login')
  @Public()
  @Throttle(STRICT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with email and password' })
  login(@Body() dto: LoginDto, @ReqMeta() meta: RequestMeta) {
    return this.auth.login(dto, meta);
  }

  @Post('refresh')
  @Public()
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate the refresh token and get a new access token' })
  refresh(@Body() dto: RefreshDto, @ReqMeta() meta: RequestMeta) {
    return this.auth.refresh(dto.refreshToken, meta);
  }

  /** Public: possession of the refresh token is the proof, so sign-out works even with an expired access token. */
  @Post('logout')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'End this session (revokes the refresh token family)' })
  async logout(@Body() dto: LogoutDto): Promise<void> {
    await this.auth.logout(dto.refreshToken);
  }

  @Post('verify')
  @ApiBearerAuth()
  @Throttle(STRICT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm email or phone with a 6-digit code' })
  verify(@CurrentUser() user: RequestUser, @Body() dto: VerifyDto) {
    return this.auth.verify(user.id, dto.purpose, dto.code);
  }

  @Post('verify/resend')
  @ApiBearerAuth()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a new verification code' })
  resend(@CurrentUser() user: RequestUser, @Body() dto: ResendVerificationDto) {
    return this.auth.resendVerification(user.id, dto.purpose);
  }

  @Post('forgot-password')
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Email a password reset code (always reports success)' })
  forgotPassword(@Body() dto: ForgotPasswordDto, @ReqMeta() meta: RequestMeta) {
    return this.auth.forgotPassword(dto.email, meta);
  }

  @Post('reset-password')
  @Public()
  @Throttle(STRICT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set a new password using the emailed code; signs out every device' })
  resetPassword(@Body() dto: ResetPasswordDto, @ReqMeta() meta: RequestMeta) {
    return this.auth.resetPassword(dto, meta);
  }

  @Post('change-password')
  @ApiBearerAuth()
  @Throttle(STRICT)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Change password; signs out every device' })
  async changePassword(@CurrentUser() user: RequestUser, @Body() dto: ChangePasswordDto, @ReqMeta() meta: RequestMeta): Promise<void> {
    await this.auth.changePassword(user.id, dto, meta);
  }
}
