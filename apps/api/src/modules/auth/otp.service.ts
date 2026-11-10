import { HttpStatus, Injectable } from '@nestjs/common';
import { createHmac, randomInt, timingSafeEqual } from 'crypto';
import { VerificationPurpose } from '@prisma/client';
import { ApiErrorCode } from '@gymova/shared-types';
import { PrismaService } from '../../database/prisma.service';
import { AppConfigService } from '../../config/app-config.service';
import { AppException, RateLimitedError } from '../../common/errors/app.errors';

export const OTP_TTL_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;

/** Six-digit one-time codes for email/phone verification and password reset. Codes are stored hashed. */
@Injectable()
export class OtpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
  ) {}

  private hash(userId: string, purpose: VerificationPurpose, code: string): string {
    return createHmac('sha256', this.config.jwt.accessSecret).update(`${userId}:${purpose}:${code}`).digest('hex');
  }

  /** Creates a new code, invalidating any earlier unused code for the same purpose. */
  async create(userId: string, purpose: VerificationPurpose, target: string): Promise<{ code: string; expiresInSeconds: number }> {
    const latest = await this.prisma.verificationToken.findFirst({
      where: { userId, purpose, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (latest && Date.now() - latest.createdAt.getTime() < OTP_RESEND_COOLDOWN_SECONDS * 1000) {
      throw new RateLimitedError(`Please wait ${OTP_RESEND_COOLDOWN_SECONDS} seconds before requesting another code`);
    }

    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    await this.prisma.$transaction([
      this.prisma.verificationToken.updateMany({ where: { userId, purpose, consumedAt: null }, data: { consumedAt: new Date() } }),
      this.prisma.verificationToken.create({
        data: {
          userId,
          purpose,
          target,
          codeHash: this.hash(userId, purpose, code),
          expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60_000),
        },
      }),
    ]);
    return { code, expiresInSeconds: OTP_TTL_MINUTES * 60 };
  }

  /** Validates and consumes a code. Returns the target (email/phone) it was issued for. */
  async consume(userId: string, purpose: VerificationPurpose, code: string): Promise<string> {
    const token = await this.prisma.verificationToken.findFirst({
      where: { userId, purpose, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (!token || token.expiresAt <= new Date() || token.attempts >= OTP_MAX_ATTEMPTS) {
      throw new AppException(ApiErrorCode.OTP_EXPIRED, 'This code has expired. Request a new one.', HttpStatus.BAD_REQUEST);
    }

    const expected = Buffer.from(token.codeHash, 'hex');
    const actual = Buffer.from(this.hash(userId, purpose, code), 'hex');
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      await this.prisma.verificationToken.update({ where: { id: token.id }, data: { attempts: { increment: 1 } } });
      throw new AppException(ApiErrorCode.OTP_INVALID, 'The code is incorrect', HttpStatus.BAD_REQUEST);
    }

    const consumed = await this.prisma.verificationToken.updateMany({
      where: { id: token.id, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    if (consumed.count !== 1) {
      throw new AppException(ApiErrorCode.OTP_EXPIRED, 'This code has already been used', HttpStatus.BAD_REQUEST);
    }
    return token.target;
  }
}
