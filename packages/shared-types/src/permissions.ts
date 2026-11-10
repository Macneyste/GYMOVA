/**
 * Permission codes. Authorization is permission-based: guards check codes, never role names.
 * Roles are bundles of permissions seeded in the database (see apps/api/prisma/seed).
 */
export const Permissions = {
  // self-service (every authenticated account)
  PROFILE_READ_SELF: 'profile:read:self',
  PROFILE_WRITE_SELF: 'profile:write:self',
  FITNESS_SELF: 'fitness:self',
  NUTRITION_SELF: 'nutrition:self',
  AI_COACH_USE: 'ai:coach:use',
  AI_SCANNER_USE: 'ai:scanner:use',
  PROGRESS_SELF: 'progress:self',
  GYM_BROWSE: 'gym:browse',
  MEMBERSHIP_SELF: 'membership:self',
  BOOKING_SELF: 'booking:self',
  CHALLENGE_JOIN: 'challenge:join',
  // trainer
  TRAINER_PROFILE_WRITE: 'trainer:profile:write',
  TRAINER_CLIENTS_READ: 'trainer:clients:read',
  TRAINER_PLANS_WRITE: 'trainer:plans:write',
  TRAINER_BOOKINGS_MANAGE: 'trainer:bookings:manage',
  // reception
  MEMBERS_READ: 'members:read',
  MEMBERS_WRITE: 'members:write',
  ATTENDANCE_MANAGE: 'attendance:manage',
  SUBSCRIPTIONS_READ: 'subscriptions:read',
  SUBSCRIPTIONS_WRITE: 'subscriptions:write',
  PAYMENTS_RECORD: 'payments:record',
  INVOICES_READ: 'invoices:read',
  // gym admin
  GYM_MANAGE: 'gym:manage',
  BRANCHES_MANAGE: 'branches:manage',
  STAFF_MANAGE: 'staff:manage',
  TRAINERS_MANAGE: 'trainers:manage',
  PLANS_MANAGE: 'plans:manage',
  CLASSES_MANAGE: 'classes:manage',
  PAYMENTS_MANAGE: 'payments:manage',
  REPORTS_GYM: 'reports:gym',
  NOTIFICATIONS_GYM_SEND: 'notifications:gym:send',
  // super admin
  PLATFORM_GYMS_MANAGE: 'platform:gyms:manage',
  PLATFORM_USERS_MANAGE: 'platform:users:manage',
  PLATFORM_ROLES_MANAGE: 'platform:roles:manage',
  PLATFORM_CATALOG_MANAGE: 'platform:catalog:manage',
  PLATFORM_AI_CONFIG: 'platform:ai:config',
  PLATFORM_AUDIT_READ: 'platform:audit:read',
  PLATFORM_REPORTS: 'platform:reports',
  PLATFORM_SETTINGS: 'platform:settings',
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];

export const ALL_PERMISSIONS: readonly Permission[] = Object.values(Permissions);

const self: Permission[] = [
  Permissions.PROFILE_READ_SELF,
  Permissions.PROFILE_WRITE_SELF,
  Permissions.FITNESS_SELF,
  Permissions.NUTRITION_SELF,
  Permissions.AI_COACH_USE,
  Permissions.AI_SCANNER_USE,
  Permissions.PROGRESS_SELF,
  Permissions.GYM_BROWSE,
  Permissions.MEMBERSHIP_SELF,
  Permissions.BOOKING_SELF,
  Permissions.CHALLENGE_JOIN,
];

const trainer: Permission[] = [
  ...self,
  Permissions.TRAINER_PROFILE_WRITE,
  Permissions.TRAINER_CLIENTS_READ,
  Permissions.TRAINER_PLANS_WRITE,
  Permissions.TRAINER_BOOKINGS_MANAGE,
];

const receptionist: Permission[] = [
  ...self,
  Permissions.MEMBERS_READ,
  Permissions.MEMBERS_WRITE,
  Permissions.ATTENDANCE_MANAGE,
  Permissions.SUBSCRIPTIONS_READ,
  Permissions.SUBSCRIPTIONS_WRITE,
  Permissions.PAYMENTS_RECORD,
  Permissions.INVOICES_READ,
];

const gymAdmin: Permission[] = [
  ...receptionist,
  Permissions.TRAINER_CLIENTS_READ,
  Permissions.GYM_MANAGE,
  Permissions.BRANCHES_MANAGE,
  Permissions.STAFF_MANAGE,
  Permissions.TRAINERS_MANAGE,
  Permissions.PLANS_MANAGE,
  Permissions.CLASSES_MANAGE,
  Permissions.PAYMENTS_MANAGE,
  Permissions.REPORTS_GYM,
  Permissions.NOTIFICATIONS_GYM_SEND,
];

/** Default permission bundles per role. Seeded into RolePermission rows. */
export const RolePermissionDefaults: Record<string, readonly Permission[]> = {
  MEMBER: self,
  TRAINER: trainer,
  RECEPTIONIST: receptionist,
  GYM_ADMIN: gymAdmin,
  SUPER_ADMIN: ALL_PERMISSIONS,
};
