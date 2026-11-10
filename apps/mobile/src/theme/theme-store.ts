import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemePreference } from '@gymova/shared-types';

interface ThemeState {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

/** Theme preference persisted locally (non-sensitive). Mirrored to the server profile when signed in. */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      preference: 'SYSTEM',
      setPreference: (preference) => set({ preference }),
    }),
    { name: 'gymova.theme', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
