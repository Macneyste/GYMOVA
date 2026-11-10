import { HttpStatus, Injectable, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common';
import { Prisma, VerificationPurpose } from '@prisma/client';
import * as argon2 from 'argon2';
import { ApiErrorCode, RoleName, type AuthSession, type AuthTokens, type AuthUser } from '@gymova/shared-types';
import { PrismaService } from '../../database/prisma.service';
import { AppConfigService } from '../../config/app-config.service';
import { AppException, ConflictError, ForbiddenError, UnauthorizedError } from '../../common/errors/app.errors';
import { PrincipalService, principalInclude } from '../../common/auth/principal.service';
import type { RequestMeta } from '../../common/auth/request-user';
import { MessagingService } from '../messaging/messaging.service';
import { TokenService } from './token.service';
import { OTP_TTL_MINUTES, OtpService } from './otp.service';
import type { ChangePasswordDto, LoginDto, RegisterDto, ResetPasswordDto } from './dto/auth.dto';

export const MAX_FAILED_LOGINS = 5;
export const LOCKOUT_MINUTES = 15;

const ARGON_OPTIONS: argon2.Options = { type: argon2.argon2id, memoryCost: 19_456, timeCost: 2, parallelism: 1 };

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  /** Verified against when the email is unknown, so response time does not reveal which accounts exist. */
  private dummyHash = '';

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
    private readonly tokens: TokenService,
    private readonly otp: OtpService,
    private readonly messaging: MessagingService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.dummyHash = await argon2.hash('gymova-timing-equaliser-password', ARGON_OPTIONS);
  }

  hashPassword(password: string): Promise<string> {
    return argon2.hash(password, ARGON_OPTIONS);
  }

  // ---------------------------------------------------------------- register / login

  async register(dto: RegisterDto, meta: RequestMeta): Promise<AuthSession> {
    const roleNames: string[] = [RoleName.MEMBER];
    if (this.config.bootstrapSuperAdminEmails.includes(dto.email)) roleNames.push(RoleName.SUPER_ADMIN);
    const roles = await this.prisma.role.findMany({ where: { name: { in: roleNames } } });
    if (roles.length !== roleNames.length) {
      this.logger.error('System roles are missing. Run `npm run db:seed`.');
      throw new InternalServerErrorException('Roles are not configured');
    }

    const passwordHash = await this.hashPassword(dto.password);
    let user;
    try {
      user = await this.prisma.user.create({
        data: {
          email: dto.email,
          phone: dto.phone ?? null,
          fullName: dto.fullName,
          passwordHash,
          preferredLanguage: dto.preferredLanguage ?? 'en',
          lastLoginAt: new Date(),
          profile: { create: {} },
          roles: { create: roles.map((r) => ({ roleId: r.id })) },
        },
        include: principalInclude,
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        const target = String((err.meta?.target as string[] | string | undefined) ?? '');
        throw new ConflictError(
          target.includes('phone') ? 'An account with this phone number already exists' : 'An account with this email already exists',
          { field: target.includes('phone') ? 'phone' : 'email' },
        );
      }
      throw err;
    }

    await this.audit(user.id, 'auth.register', meta);
    await this.sendVerification(user.id, 'EMAIL_VERIFY', user.email, user.preferredLanguage).catch((err: unknown) =>
      this.logger.warn(`Could not send verification email: ${String(err)}`),
    );
    const { refreshTokenId: _id, ...tokens } = await this.tokens.issue(user.id, meta);
    return { ...tokens, user: PrincipalService.toAuthUser(user) };
  }

  async login(dto: LoginDto, meta: RequestMeta): Promise<AuthSession> {
    const user = await this.prisma.user.findFirst({ where: { email: dto.email, deletedAt: null }, include: principalInclude });
    const invalid = () => new UnauthorizedError('Email or password is incorrect', ApiErrorCode.INVALID_CREDENTIALS);

    if (!user) {
      await argon2.verify(this.dummyHash, dto.password).catch(() => false);
      throw invalid();
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60_000);
      throw new AppException(
        ApiErrorCode.ACCOUNT_LOCKED,
        `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`,
        HttpStatus.TOO_MANY_REQUESTS,
        { retryAfterSeconds: minutes * 60 },
      );
    }

    const ok = await argon2.verify(user.passwordHash, dto.password).catch(() => false);
    if (!ok) {
      const attempts = user.failedLoginAttempts + 1;
      const lock = attempts >= MAX_FAILED_LOGINS;
      await this.prisma.user.update({
        where: { id: user.id },
        data: lock
          ? { failedLoginAttempts: 0, lockedUntil: new Date(Date.now() + LOCKOUT_MINUTES * 60_000) }
          : { failedLoginAttempts: attempts },
      });
      await this.audit(user.id, lock ? 'auth.lockout' : 'auth.login_failed', meta);
      throw invalid();
    }

    if (!user.isActive) throw new AppException(ApiErrorCode.ACCOUNT_DISABLED, 'This account has been disabled', HttpStatus.FORBIDDEN);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
    });
    await this.audit(user.id, 'auth.login', meta);
    const { refreshTokenId: _id, ...tokens } = await this.tokens.issue(user.id, meta);
    return { ...tokens, user: PrincipalService.toAuthUser(user) };
  }

  refresh(refreshToken: string, meta: RequestMeta): Promise<AuthTokens> {
    return this.tokens.rotate(refreshToken, meta).then((r) => r.tokens);
  }

  async logout(refreshToken: string | null | undefined): Promise<void> {
    if (refreshToken) await this.tokens.revokeByToken(refreshToken);
  }

  // ---------------------------------------------------------------- verification

  async resendVerification(userId: string, purpose: 'EMAIL_VERIFY' | 'PHONE_VERIFY'): Promise<{ sent: boolean; expiresInSeconds: number }> {
    const user = await this.requireUser(userId);
    if (purpose === 'EMAIL_VERIFY' && user.emailVerifiedAt) throw new ConflictError('Email is already verified');
    if (purpose === 'PHONE_VERIFY') {
      if (!user.phone) throw new AppException(ApiErrorCode.VALIDATION, 'Add a phone number first', HttpStatus.BAD_REQUEST);
      if (user.phoneVerifiedAt) throw new ConflictError('Phone is already verified');
    }
    const target = purpose === 'EMAIL_VERIFY' ? user.email : (user.phone as string);
    const expiresInSeconds = await this.sendVerification(user.id, purpose, target, user.preferredLanguage);
    return { sent: true, expiresInSeconds };
  }

  async verify(userId: string, purpose: 'EMAIL_VERIFY' | 'PHONE_VERIFY', code: string): Promise<AuthUser> {
    const user = await this.requireUser(userId);
    const target = await this.otp.consume(userId, purpose, code);
    const current = purpose === 'EMAIL_VERIFY' ? user.email : user.phone;
    if (target !== current) {
      // The address changed after the code was sent.
      throw new AppException(ApiErrorCode.OTP_EXPIRED, 'This code is no longer valid. Request a new one.', HttpStatus.BAD_REQUEST);
    }
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: purpose === 'EMAIL_VERIFY' ? { emailVerifiedAt: new Date() } : { phoneVerifiedAt: new Date() },
      include: principalInclude,
    });
    return PrincipalService.toAuthUser(updated);
  }

  // ---------------------------------------------------------------- passwords

  /** Always reports success so the endpoint cannot be used to discover registered emails. */
  async forgotPassword(email: string, meta: RequestMeta): Promise<{ sent: boolean }> {
    const user = await this.prisma.user.findFirst({ where: { email, deletedAt: null, isActive: true } });
    if (user) {
      try {
        await this.sendVerification(user.id, 'PASSWORD_RESET', user.email, user.preferredLanguage);
        await this.audit(user.id, 'auth.password_reset_requested', meta);
      } catch (err) {
        // Cooldown hits are swallowed for the same reason.
        if (!(err instanceof AppException && err.code === ApiErrorCode.RATE_LIMITED)) throw err;
      }
    }
    return { sent: true };
  }

  async resetPassword(dto: ResetPasswordDto, meta: RequestMeta): Promise<{ reset: boolean }> {
    const user = await this.prisma.user.findFirst({ where: { email: dto.email, deletedAt: null, isActive: true } });
    if (!user) throw new AppException(ApiErrorCode.OTP_INVALID, 'The code is incorrect', HttpStatus.BAD_REQUEST);
    await this.otp.consume(user.id, 'PASSWORD_RESET', dto.code);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await this.hashPassword(dto.password),
        failedLoginAttempts: 0,
        lockedUntil: null,
        // Receiving the code proves control of the inbox.
        emailVerifiedAt: user.emailVerifiedAt ?? new Date(),
      },
    });
    await this.tokens.revokeAllForUser(user.id);
    await this.audit(user.id, 'auth.password_reset', meta);
    return { reset: true };
  }

  async changePassword(userId: string, dto: ChangePasswordDto, meta: RequestMeta): Promise<void> {
    const user = await this.requireUser(userId);
    const ok = await argon2.verify(user.passwordHash, dto.currentPassword).catch(() => false);
    if (!ok) throw new UnauthorizedError('Current password is incorrect', ApiErrorCode.INVALID_CREDENTIALS);
    if (dto.currentPassword === dto.newPassword) {
      throw new AppException(ApiErrorCode.VALIDATION, 'Choose a password you have not used here', HttpStatus.BAD_REQUEST);
    }
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash: await this.hashPassword(dto.newPassword) } });
    await this.tokens.revokeAllForUser(userId);
    await this.audit(userId, 'auth.password_changed', meta);
  }

  // ---------------------------------------------------------------- helpers

  private async requireUser(userId: string) {
    const user = await this.prisma.user.findFirst({ where: { id: userId, deletedAt: null } });
    if (!user) throw new UnauthorizedError('Account no longer exists', ApiErrorCode.SESSION_EXPIRED);
    if (!user.isActive) throw new ForbiddenError('This account has been disabled');
    return user;
  }

  private async sendVerification(userId: string, purpose: VerificationPurpose, target: string, language: string): Promise<number> {
    const { code, expiresInSeconds } = await this.otp.create(userId, purpose, target);
    await this.messaging.sendOtp({
      channel: purpose === 'PHONE_VERIFY' ? 'sms' : 'email',
      to: target,
      code,
      purpose,
      language,
      expiresInMinutes: OTP_TTL_MINUTES,
    });
    return expiresInSeconds;
  }

  private async audit(actorId: string, action: string, meta: RequestMeta): Promise<void> {
    await this.prisma.auditLog
      .create({ data: { actorId, action, entity: 'User', entityId: actorId, ipAddress: meta.ipAddress, userAgent: meta.userAgent } })
      .catch((err: unknown) => this.logger.warn(`Audit write failed: ${String(err)}`));
  }
}
