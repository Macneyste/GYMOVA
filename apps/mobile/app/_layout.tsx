import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as NavThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { queryClient } from '@/services/query-client';
import { initI18n } from '@/localization/i18n';
import { useSession } from '@/store/session';
import { useTheme } from '@/theme';
import { useNetworkListener, useIsOnline } from '@/hooks/useNetwork';
import { OfflineBanner, ToastHost } from '@/components/ui';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  const [i18nReady, setI18nReady] = useState(false);
  const status = useSession((s) => s.status);
  const hydrate = useSession((s) => s.hydrate);

  useEffect(() => {
    void initI18n().then(() => setI18nReady(true));
    void hydrate();
  }, [hydrate]);

  const ready = fontsLoaded && i18nReady && status !== 'booting';

  const onLayout = useCallback(() => {
    if (ready) void SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayout}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemedApp />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function ThemedApp() {
  const theme = useTheme();
  const isOnline = useIsOnline();
  useNetworkListener();
  useAuthGate();

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(theme.colors.background).catch(() => undefined);
  }, [theme.colors.background]);

  const navTheme = {
    ...(theme.isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme.isDark ? DarkTheme : DefaultTheme).colors,
      primary: theme.colors.accent,
      background: theme.colors.background,
      card: theme.colors.card,
      text: theme.colors.textPrimary,
      border: theme.colors.border,
      notification: theme.colors.accent,
    },
  };

  return (
    <NavThemeProvider value={navTheme}>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <StatusBar style={theme.isDark ? 'light' : 'dark'} />
        <OfflineBanner visible={!isOnline} />
        <Stack screenOptions={{ headerShown: false, animation: 'fade_from_bottom', contentStyle: { backgroundColor: theme.colors.background } }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(app)" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <ToastHost />
      </View>
    </NavThemeProvider>
  );
}

/**
 * Protected route groups: unauthenticated users can only see (auth); authenticated users are kept out of it.
 * Onboarding redirection (assessment) is handled inside (tabs) once profile data is known.
 */
function useAuthGate() {
  const status = useSession((s) => s.status);
  const emailVerified = useSession((s) => !!s.user?.emailVerifiedAt);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (status === 'booting') return;
    const inAuthGroup = segments[0] === '(auth)';
    if (status === 'signedOut' && !inAuthGroup) router.replace('/(auth)/welcome');
    // Fresh sign-ins with an unverified email are offered verification once; they may skip it.
    if (status === 'signedIn' && inAuthGroup) router.replace(emailVerified ? '/(tabs)' : '/(app)/verify-email');
  }, [status, emailVerified, segments, router]);
}
