import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme';

/** Secondary screens reached from the tabs (scanner, planner, gym, settings …). */
export default function AppStackLayout() {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontFamily: typography.fontFamily.semibold, fontSize: 17 },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="scanner" options={{ title: t('nav.scanner') }} />
      <Stack.Screen name="planner" options={{ title: t('nav.planner') }} />
      <Stack.Screen name="challenges" options={{ title: t('nav.challenges') }} />
      <Stack.Screen name="gym/index" options={{ title: t('nav.gym') }} />
      <Stack.Screen name="trainers/index" options={{ title: t('nav.trainers') }} />
      <Stack.Screen name="notifications" options={{ title: t('nav.notifications') }} />
      <Stack.Screen name="profile" options={{ title: t('nav.profile') }} />
      <Stack.Screen name="settings/index" options={{ title: t('nav.settings') }} />
      <Stack.Screen name="verify-email" options={{ headerShown: false, gestureEnabled: false }} />
    </Stack>
  );
}
