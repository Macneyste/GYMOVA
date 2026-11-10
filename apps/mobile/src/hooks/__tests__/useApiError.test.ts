import { renderHook } from '@testing-library/react-native';
import { ApiError, NetworkError } from '@gymova/api-client';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/localization/en.json';
import so from '@/localization/so.json';
import { useApiErrorMessage } from '../useApiError';

beforeAll(async () => {
  await i18n.use(initReactI18next).init({ lng: 'en', resources: { en: { translation: en }, so: { translation: so } }, interpolation: { escapeValue: false } });
});

const err = (status: number, code: string, message = 'server message', details?: unknown) =>
  new ApiError(status, { code, message, details } as never);

describe('useApiErrorMessage', () => {
  const map = () => renderHook(() => useApiErrorMessage()).result.current;

  it('maps auth error codes to friendly copy', () => {
    const m = map();
    expect(m(err(401, 'INVALID_CREDENTIALS'))).toBe(en.auth.invalidCredentials);
    expect(m(err(429, 'ACCOUNT_LOCKED'))).toBe(en.auth.accountLocked);
    expect(m(err(400, 'OTP_INVALID'))).toBe(en.auth.otpInvalid);
    expect(m(err(400, 'OTP_EXPIRED'))).toBe(en.auth.otpExpired);
    expect(m(err(429, 'RATE_LIMITED'))).toBe(en.auth.tooManyRequests);
  });

  it('translates the first validation key', () => {
    expect(map()(err(400, 'VALIDATION_ERROR', 'Validation failed', [{ field: 'password', constraints: ['password.min'] }]))).toBe(
      en.validation['password.min'],
    );
  });

  it('never shows raw 5xx messages and handles offline', () => {
    const m = map();
    expect(m(err(500, 'INTERNAL_ERROR', 'stack trace'))).toBe(en.common.errorDescription);
    expect(m(new NetworkError('fetch failed'))).toBe(en.common.offline);
  });

  it('follows the selected language', async () => {
    await i18n.changeLanguage('so');
    expect(map()(err(401, 'INVALID_CREDENTIALS'))).toBe(so.auth.invalidCredentials);
    await i18n.changeLanguage('en');
  });
});
