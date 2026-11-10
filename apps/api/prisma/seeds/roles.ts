import type { PrismaClient } from '@prisma/client';
import { ALL_PERMISSIONS, RoleName, RolePermissionDefaults } from '@gymova/shared-types';

const roleDescriptions: Record<string, string> = {
  MEMBER: 'Independent fitness user or gym member',
  TRAINER: 'Personal trainer who manages assigned clients',
  RECEPTIONIST: 'Front-desk staff: registration, check-ins, payments',
  GYM_ADMIN: 'Manages a gym tenant: branches, staff, plans, finance',
  SUPER_ADMIN: 'Platform administrator',
};

export async function seedRolesAndPermissions(prisma: PrismaClient): Promise<void> {
  for (const code of ALL_PERMISSIONS) {
    await prisma.permission.upsert({ where: { code }, update: {}, create: { code } });
  }
  const permissions = await prisma.permission.findMany();
  const byCode = new Map(permissions.map((p) => [p.code, p.id]));

  for (const name of Object.values(RoleName)) {
    const role = await prisma.role.upsert({
      where: { name },
      update: { description: roleDescriptions[name] },
      create: { name, description: roleDescriptions[name], isSystem: true },
    });
    const codes = RolePermissionDefaults[name] ?? [];
    // Reconcile: system roles always match the code-defined bundle.
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id, permission: { code: { notIn: [...codes] } } } });
    for (const code of codes) {
      const permissionId = byCode.get(code);
      if (!permissionId) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId } },
        update: {},
        create: { roleId: role.id, permissionId },
      });
    }
  }
}
