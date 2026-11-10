import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHmac, randomBytes, randomUUID } from 'crypto';
import { ApiErrorCode, type AuthTokens } from '@gymova/shared-types';
import { PrismaService } from '../../database/prisma.service';
import { AppConfigService } from '../../config/app-config.service';
import { UnauthorizedError } from '../../common/errors/app.errors';
import type { RequestMeta } from '../../common/auth/request-user';
import { JWT_AUDIENCE, JWT_ISSUER, type AccessTokenPayload } from '../../common/guards/jwt-auth.guard';

/**
 * Short-lived JWT access tokens + opaque, rotating refresh tokens.
 * Refresh tokens are stored only as HMAC hashes. Each login starts a token "family"; presenting a
 * refresh token that was already rotated is treated as theft and revokes the whole family.
 */
@Injectable()
export class TokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: AppConfigService,
  ) {}

  hash(rawToken: string): string {
    return createHmac('sha256', this.config.jwt.refreshSecret).update(rawToken).digest('hex');
  }

  async issue(userId: string, meta: RequestMeta, family: string = randomUUID()): Promise<AuthTokens & { refreshTokenId: string }> {
    const { accessSecret, accessTtlSeconds, refreshTtlDays } = this.config.jwt;
    const payload: AccessTokenPayload = { sub: userId, typ: 'access' };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: accessSecret,
      expiresIn: accessTtlSeconds,
      algorithm: 'HS256',
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    const refreshToken = randomBytes(48).toString('base64url');
    const record = await this.prisma.refreshToken.create({
      data: {
        userId,
        family,
        tokenHash: this.hash(refreshToken),
        deviceName: meta.userAgent,
        ipAddress: meta.ipAddress,
        expiresAt: new Date(Date.now() + refreshTtlDays * 86_400_000),
      },
    });
    return { accessToken, refreshToken, accessTokenExpiresIn: accessTtlSeconds, refreshTokenId: record.id };
  }

  /** Exchanges a refresh token for a new pair. The presented token becomes unusable. */
  async rotate(rawToken: string, meta: RequestMeta): Promise<{ userId: string; tokens: AuthTokens }> {
    const expired = () => new UnauthorizedError('Your session has expired, please sign in again', ApiErrorCode.SESSION_EXPIRED);
    const existing = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: this.hash(rawToken) },
      include: { user: { select: { isActive: true, deletedAt: true } } },
    });
    if (!existing) throw expired();

    if (existing.revokedAt) {
      // Reuse of a rotated token: assume it leaked and end every session in this family.
      await this.revokeFamily(existing.family);
      throw expired();
    }
    if (existing.expiresAt <= new Date() || !existing.user.isActive || existing.user.deletedAt) {
      await this.revokeFamily(existing.family);
      throw expired();
    }

    // Conditional update guards against two concurrent refreshes both succeeding.
    const claimed = await this.prisma.refreshToken.updateMany({
      where: { id: existing.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (claimed.count !== 1) {
      await this.revokeFamily(existing.family);
      throw expired();
    }

    const { refreshTokenId, ...tokens } = await this.issue(existing.userId, meta, existing.family);
    await this.prisma.refreshToken.update({ where: { id: existing.id }, data: { replacedBy: refreshTokenId } });
    return { userId: existing.userId, tokens };
  }

  async revokeByToken(rawToken: string): Promise<void> {
    const existing = await this.prisma.refreshToken.findUnique({ where: { tokenHash: this.hash(rawToken) } });
    if (existing) await this.revokeFamily(existing.family);
  }

  async revokeFamily(family: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({ where: { family, revokedAt: null }, data: { revokedAt: new Date() } });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
  }
}
