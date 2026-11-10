import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { ApiErrorCode } from '@gymova/shared-types';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ForbiddenError, UnauthorizedError } from '../errors/app.errors';
import { AppConfigService } from '../../config/app-config.service';
import { PrincipalService } from '../auth/principal.service';
import type { RequestUser } from '../auth/request-user';

export interface AccessTokenPayload {
  sub: string;
  typ: 'access';
}

/**
 * Global guard: every route requires a valid access token unless marked @Public().
 * The user is reloaded on every request so disabled/deleted accounts and role changes take effect immediately.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly config: AppConfigService,
    private readonly principals: PrincipalService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [ctx.getHandler(), ctx.getClass()]);
    if (isPublic) return true;

    const req = ctx.switchToHttp().getRequest<Request & { user?: RequestUser }>();
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw new UnauthorizedError();

    let payload: AccessTokenPayload;
    try {
      payload = await this.jwt.verifyAsync<AccessTokenPayload>(header.slice(7), {
        secret: this.config.jwt.accessSecret,
        algorithms: ['HS256'],
      });
    } catch {
      throw new UnauthorizedError('Access token is invalid or expired');
    }
    if (payload.typ !== 'access' || !payload.sub) throw new UnauthorizedError('Access token is invalid or expired');

    const principal = await this.principals.load(payload.sub);
    if (!principal) throw new UnauthorizedError('Account no longer exists', ApiErrorCode.SESSION_EXPIRED);
    if (!principal.isActive) throw new ForbiddenError('This account has been disabled');

    req.user = { id: principal.id, email: principal.email, roles: principal.roles, permissions: principal.permissions };
    return true;
  }
}
