import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthSession, AuthUser } from '@gymova/shared-types';
import { ApiError, NetworkError } from '@gymova/api-client';
import { api, onSessionExpired, tokenStorage } from '@/services/api';

/** Cached profile (email, phone, roles) is personal data, so it lives in the encrypted keystore, not AsyncStorage. */
const USER_CACHE_KEY = 'gymova.user';
const LEGACY_USER_CACHE_KEY = 'gymova.user'; // older builds kept it in plain AsyncStorage
const cache = {
  get: () => SecureStore.getItemAsync(USER_CACHE_KEY),
  set: (v: string) => SecureStore.setItemAsync(USER_CACHE_KEY, v),
  clear: async () => {
    await SecureStore.deleteItemAsync(USER_CACHE_KEY);
    await AsyncStorage.removeItem(LEGACY_USER_CACHE_KEY);
  },
};

export type SessionStatus = 'booting' | 'signedOut' | 'signedIn';

interface SessionState {
  status: SessionStatus;
  user: AuthUser | null;
  /** True when the last sign-out was forced by an expired refresh token. */
  expired: boolean;
  hydrate: () => Promise<void>;
  signIn: (session: AuthSession) => Promise<void>;
  setUser: (user: AuthUser) => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
  signOut: (opts?: { expired?: boolean; remote?: boolean }) => Promise<void>;
}

export const useSession = create<SessionState>((set, get) => ({
  status: 'booting',
  user: null,
  expired: false,

  async hydrate() {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (!refreshToken) return set({ status: 'signedOut', user: null });
    // Optimistically restore the cached profile (non-sensitive) so the UI renders instantly, then revalidate.
    let cached: AuthUser | null = null;
    try {
      await AsyncStorage.removeItem(LEGACY_USER_CACHE_KEY).catch(() => undefined);
      const raw = await cache.get();
      cached = raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      cached = null;
    }
    set({ status: 'signedIn', user: cached });
    try {
      const user = await api.users.me();
      await get().setUser(user);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) await get().signOut({ expired: true });
      else if (!(err instanceof NetworkError) && !cached) await get().signOut();
      // Offline with a cached user: stay signed in.
    }
  },

  async signIn(session) {
    await tokenStorage.setTokens(session);
    await cache.set(JSON.stringify(session.user)).catch(() => undefined);
    set({ status: 'signedIn', user: session.user, expired: false });
  },

  async setUser(user) {
    await cache.set(JSON.stringify(user)).catch(() => undefined);
    set({ user });
  },

  async refreshUser() {
    try {
      const user = await api.users.me();
      await get().setUser(user);
      return user;
    } catch {
      return get().user;
    }
  },

  async signOut(opts) {
    if (opts?.remote !== false) {
      const refreshToken = await tokenStorage.getRefreshToken();
      await api.auth.logout(refreshToken).catch(() => undefined);
    }
    await tokenStorage.clear();
    await cache.clear().catch(() => undefined);
    set({ status: 'signedOut', user: null, expired: !!opts?.expired });
  },
}));

onSessionExpired(() => {
  if (useSession.getState().status === 'signedIn') void useSession.getState().signOut({ expired: true, remote: false });
});

export function hasPermission(user: AuthUser | null, permission: string): boolean {
  return !!user?.permissions.includes(permission as AuthUser['permissions'][number]);
}
