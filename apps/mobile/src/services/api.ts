import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { createApi, type TokenStorage } from '@gymova/api-client';
import type { AuthTokens } from '@gymova/shared-types';
import { currentLanguage } from '@/localization/i18n';

const ACCESS_KEY = 'gymova.accessToken';
const REFRESH_KEY = 'gymova.refreshToken';

/** Tokens live only in the device keystore (Expo SecureStore). Nothing else is persisted securely. */
export const tokenStorage: TokenStorage = {
  getAccessToken: () => SecureStore.getItemAsync(ACCESS_KEY),
  getRefreshToken: () => SecureStore.getItemAsync(REFRESH_KEY),
  async setTokens(tokens: AuthTokens) {
    await SecureStore.setItemAsync(ACCESS_KEY, tokens.accessToken);
    await SecureStore.setItemAsync(REFRESH_KEY, tokens.refreshToken);
  },
  async clear() {
    await SecureStore.deleteItemAsync(ACCESS_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
  },
};

export const API_URL: string = resolveApiUrl(
  process.env.EXPO_PUBLIC_API_URL ?? (Constants.expoConfig?.extra?.apiUrl as string | undefined) ?? 'http://10.0.2.2:3000/api/v1',
);

/**
 * Release builds only talk to the API over HTTPS: passwords and tokens must never travel in clear text.
 * Plain http is allowed in development (emulator → localhost).
 */
export function resolveApiUrl(url: string, dev: boolean = __DEV__): string {
  if (!dev && !url.startsWith('https://')) {
    throw new Error(`Insecure API URL in a release build: ${url}. Set EXPO_PUBLIC_API_URL to an https:// URL.`);
  }
  return url.replace(//+$/, '');
}

type SessionExpiredHandler = () => void | Promise<void>;
let sessionExpiredHandler: SessionExpiredHandler | null = null;
export function onSessionExpired(handler: SessionExpiredHandler): void {
  sessionExpiredHandler = handler;
}

export const api = createApi({
  baseUrl: API_URL,
  tokens: tokenStorage,
  onSessionExpired: () => sessionExpiredHandler?.(),
  headers: () => ({ 'Accept-Language': currentLanguage(), 'X-Client-Version': Constants.expoConfig?.version ?? '1.0.0' }),
  timeoutMs: 25_000,
});
