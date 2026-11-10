import { useColorScheme } from 'react-native';
import { radii, spacing, themes, typography, type ThemeColors } from '@gymova/design-tokens';
import { useThemeStore } from './theme-store';

export interface Theme {
  mode: 'dark' | 'light';
  colors: ThemeColors;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
  isDark: boolean;
}

export function useTheme(): Theme {
  const system = useColorScheme();
  const preference = useThemeStore((s) => s.preference);
  const mode: 'dark' | 'light' =
    preference === 'SYSTEM' ? (system === 'light' ? 'light' : 'dark') : preference === 'LIGHT' ? 'light' : 'dark';
  return { mode, colors: themes[mode], spacing, radii, typography, isDark: mode === 'dark' };
}
