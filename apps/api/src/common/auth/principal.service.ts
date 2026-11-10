import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuthUser, Permission } from '@gymova/shared-types';
import { PrismaService } from '../../database/prisma.service';

export const principalInclude = {
  roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
  gymStaff: { where: { isActive: true } },
} satisfies Prisma.UserInclude;

export type UserWithAccess = Prisma.UserGetPayload<{ include: typeof principalInclude }>;

export interface Principal {
  id: string;
  email: string;
  isActive: boolean;
  roles: string[];
  permissions: Permission[];
}

/** Resolves a user's roles and effective permission set, and maps users to the public AuthUser shape. */
@Injectable()
export class PrincipalService {
  constructor(private readonly prisma: PrismaService) {}

  async load(userId: string): Promise<Principal | null> {
    const user = await this.prisma.user.findFirst({ where: { id: userId, deletedAt: null }, include: principalInclude });
    if (!user) return null;
    const { roles, permissions } = PrincipalService.access(user);
    return { id: user.id, email: user.email, isActive: user.isActive, roles, permissions };
  }

  async loadAuthUser(userId: string): Promise<AuthUser | null> {
    const user = await this.prisma.user.findFirst({ where: { id: userId, deletedAt: null }, include: principalInclude });
    return user ? PrincipalService.toAuthUser(user) : null;
  }

  static access(user: UserWithAccess): { roles: string[]; permissions: Permission[] } {
    const roles = user.roles.map((r) => r.role.name).sort();
    const permissions = new Set<Permission>();
    for (const r of user.roles) for (const rp of r.role.permissions) permissions.add(rp.permission.code as Permission);
    return { roles, permissions: [...permissions].sort() };
  }

  static toAuthUser(user: UserWithAccess): AuthUser {
    const { roles, permissions } = PrincipalService.access(user);
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
      emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
      phoneVerifiedAt: user.phoneVerifiedAt?.toISOString() ?? null,
      preferredLanguage: user.preferredLanguage as AuthUser['preferredLanguage'],
      themePreference: user.themePreference as AuthUser['themePreference'],
      avatarUrl: user.avatarUrl,
      roles,
      permissions,
      staffOf: user.gymStaff.map((s) => ({ gymId: s.gymId, branchId: s.branchId, role: s.role })),
      onboardingCompletedAt: user.onboardingCompletedAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
