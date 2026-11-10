import { useTranslation } from 'react-i18next';
import { ApiError, NetworkError } from '@gymova/api-client';

/** Maps API/network errors to a localised, user-safe message. */
export function useApiErrorMessage(): (error: unknown, fallbackKey?: string) => string {
  const { t } = useTranslation();
  return (error, fallbackKey = 'common.errorDescription') => {
    if (error instanceof NetworkError) return t('common.offline');
    if (error instanceof ApiError) {
      switch (error.code) {
        case 'INVALID_CREDENTIALS':
          return t('auth.invalidCredentials');
        case 'UNAUTHORIZED':
        case 'SESSION_EXPIRED':
          return t('auth.sessionExpiredBody');
        case 'ACCOUNT_LOCKED':
          return t('auth.accountLocked');
        case 'ACCOUNT_DISABLED':
          return t('auth.accountDisabled');
        case 'OTP_INVALID':
          return t('auth.otpInvalid');
        case 'OTP_EXPIRED':
          return t('auth.otpExpired');
        case 'CONFLICT':
          return error.message.toLowerCase().includes('email') ? t('auth.emailTaken') : error.message;
        case 'VALIDATION_ERROR': {
          const first = Array.isArray(error.details) ? (error.details[0] as { constraints?: string[] } | undefined) : undefined;
          const key = first?.constraints?.[0];
          return key && t(`validation.${key}`, { defaultValue: '' }) ? t(`validation.${key}`) : error.message;
        }
        case 'RATE_LIMITED':
          return t('auth.tooManyRequests');
        case 'AI_UNAVAILABLE':
        case 'AI_QUOTA_EXCEEDED':
        case 'PROFESSIONAL_GUIDANCE_REQUIRED':
          return error.message;
        default:
          return error.status >= 500 ? t(fallbackKey) : error.message;
      }
    }
    return t(fallbackKey);
  };
}
