import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { Permission } from '@gymova/shared-types';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { ForbiddenError } from '../errors/app.errors';
import type { RequestUser } from '../auth/request-user';

/** Global guard (runs after JwtAuthGuard): enforces @RequirePermissions(). */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Permission[] | undefined>(PERMISSIONS_KEY, [ctx.getHandler(), ctx.getClass()]);
    if (!required?.length) return true;
    const user = ctx.switchToHttp().getRequest<Request & { user?: RequestUser }>().user;
    if (!user || !required.every((p) => user.permissions.includes(p))) throw new ForbiddenError();
    return true;
  }
}
