import { PrincipalService, type UserWithAccess } from './principal.service';

const role = (name: string, codes: string[]) => ({
  role: { name, permissions: codes.map((code) => ({ permission: { code } })) },
});

const baseUser = {
  id: 'u1',
  email: 'a@b.c',
  phone: null,
  fullName: 'A B',
  avatarUrl: null,
  preferredLanguage: 'so',
  themePreference: 'DARK',
  emailVerifiedAt: new Date('2026-01-01T00:00:00Z'),
  phoneVerifiedAt: null,
  onboardingCompletedAt: null,
  createdAt: new Date('2025-12-31T00:00:00Z'),
  gymStaff: [{ gymId: 'g1', branchId: null, role: 'TRAINER' }],
};

describe('PrincipalService', () => {
  it('unions permissions across roles without duplicates', () => {
    const user = { ...baseUser, roles: [role('MEMBER', ['b', 'a']), role('TRAINER', ['a', 'c'])] } as unknown as UserWithAccess;
    expect(PrincipalService.access(user)).toEqual({ roles: ['MEMBER', 'TRAINER'], permissions: ['a', 'b', 'c'] });
  });

  it('maps to the public AuthUser shape without secrets', () => {
    const user = { ...baseUser, passwordHash: 'secret', roles: [role('MEMBER', ['a'])] } as unknown as UserWithAccess;
    const out = PrincipalService.toAuthUser(user);
    expect(out).not.toHaveProperty('passwordHash');
    expect(out.emailVerifiedAt).toBe('2026-01-01T00:00:00.000Z');
    expect(out.preferredLanguage).toBe('so');
    expect(out.staffOf).toEqual([{ gymId: 'g1', branchId: null, role: 'TRAINER' }]);
  });
});
