import { SetMetadata } from '@nestjs/common';
import type { Permission } from '@gymova/shared-types';

export const PERMISSIONS_KEY = 'requiredPermissions';
/** The caller must hold every listed permission code. Authorization never checks role names. */
export const RequirePermissions = (...permissions: Permission[]) => SetMetadata(PERMISSIONS_KEY, permissions);
