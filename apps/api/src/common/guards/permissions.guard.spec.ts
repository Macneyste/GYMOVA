import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permissions } from '@gymova/shared-types';
import { PermissionsGuard } from './permissions.guard';
import { ForbiddenError } from '../errors/app.errors';

function ctx(user: unknown): ExecutionContext {
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

describe('PermissionsGuard', () => {
  const reflector = new Reflector();
  const guard = new PermissionsGuard(reflector);

  it('allows routes without requirements', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(ctx(undefined))).toBe(true);
  });

  it('allows when every required permission is held', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Permissions.PROFILE_READ_SELF]);
    expect(guard.canActivate(ctx({ permissions: [Permissions.PROFILE_READ_SELF, Permissions.FITNESS_SELF] }))).toBe(true);
  });

  it('rejects when any permission is missing', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Permissions.PROFILE_READ_SELF, Permissions.PLATFORM_USERS_MANAGE]);
    expect(() => guard.canActivate(ctx({ permissions: [Permissions.PROFILE_READ_SELF] }))).toThrow(ForbiddenError);
  });

  it('rejects anonymous callers on protected routes', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Permissions.PROFILE_READ_SELF]);
    expect(() => guard.canActivate(ctx(undefined))).toThrow(ForbiddenError);
  });
});
