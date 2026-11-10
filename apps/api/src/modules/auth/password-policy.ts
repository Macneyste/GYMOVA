import { HttpStatus } from '@nestjs/common';
import { ApiErrorCode } from '@gymova/shared-types';
import { AppException } from '../../common/errors/app.errors';

/**
 * Passwords that pass the length/letter/number rules but appear at the top of every breach list,
 * plus app-specific guesses. Compared case-insensitively after removing separators.
 */
const COMMON = new Set(
  [
    'password1', 'password12', 'password123', 'password1234', 'passw0rd123', 'qwerty123', 'qwerty1234', 'qwertyuiop1',
    'abc1234567', 'abcd123456', 'iloveyou12', 'welcome123', 'welcome1234', 'letmein123', 'admin12345', 'administrator1',
    'football123', 'baseball123', 'monkey12345', 'dragon12345', 'sunshine123', 'princess123', 'master12345', 'trustno1234',
    '1q2w3e4r5t', '1qaz2wsx3edc', 'zaq12wsxcde3', 'a1b2c3d4e5', 'asdfghjkl1', 'changeme123', 'default123',
    'gymova123', 'gymova1234', 'gymova2026', 'gymovaapp1', 'fitness123', 'fitness1234', 'workout123', 'mogadishu1',
    'somalia123', 'somalia1234', 'hargeisa123',
  ].map((p) => p.toLowerCase()),
);

const normalise = (s: string) => s.toLowerCase().replace(/[\s._-]/g, '');

/** Throws VALIDATION (`password.weak`) for breached/guessable passwords or ones built from the user's identity. */
export function assertPasswordAllowed(password: string, identity: { email: string; fullName?: string | null }): void {
  const p = normalise(password);
  const local = normalise(identity.email.split('@')[0] ?? '');
  const nameParts = (identity.fullName ?? '').split(/\s+/).map(normalise).filter((n) => n.length >= 4);

  const weak =
    COMMON.has(p) ||
    /^(.)\1+\d*$/.test(p) || // aaaaaaaaa1
    /^(0123456789|1234567890|9876543210)/.test(p) ||
    (local.length >= 4 && p.includes(local)) ||
    nameParts.some((n) => p.includes(n));

  if (weak) {
    throw new AppException(ApiErrorCode.VALIDATION, 'This password is too easy to guess', HttpStatus.BAD_REQUEST, [
      { field: 'password', constraints: ['password.weak'] },
    ]);
  }
}
