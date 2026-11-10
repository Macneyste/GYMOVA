import type { Permission } from '@gymova/shared-types';

/** The authenticated principal attached to `request.user` by the JwtAuthGuard. */
export interface RequestUser {
  id: string;
  email: string;
  roles: string[];
  permissions: Permission[];
}

export interface RequestMeta {
  ipAddress: string | null;
  userAgent: string | null;
}
