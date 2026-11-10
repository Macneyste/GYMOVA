import { assertPasswordAllowed } from './password-policy';
import { AppException } from '../../common/errors/app.errors';

const who = { email: 'amina.yusuf@example.com', fullName: 'Amina Yusuf' };

describe('assertPasswordAllowed', () => {
  it.each(['Password123', 'qwerty-1234', 'Gymova2026', '1234567890ab', 'aaaaaaaaaa1'])('rejects common password %s', (p) => {
    expect(() => assertPasswordAllowed(p, who)).toThrow(AppException);
  });

  it.each(['Amina2026!x', 'yusuf-lifts-99', 'aminayusuf12'])('rejects passwords built from the name or email: %s', (p) => {
    expect(() => assertPasswordAllowed(p, who)).toThrow(AppException);
  });

  it('reports the i18n key the mobile app translates', () => {
    try {
      assertPasswordAllowed('Password123', who);
    } catch (e) {
      expect((e as AppException).details).toEqual([{ field: 'password', constraints: ['password.weak'] }]);
    }
  });

  it.each(['Tall-river-482', 'Strong-pass-123', 'camel milk 7 mornings'])('accepts %s', (p) => {
    expect(() => assertPasswordAllowed(p, who)).not.toThrow();
  });
});
