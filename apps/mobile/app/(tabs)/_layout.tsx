import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;
const icons: Record<string, [IconName, IconName]> = {
  index: ['home-outline', 'home'],
  workout: ['barbell-outline', 'barbell'],
  diet: ['restaurant-outline', 'restaurant'],
  coach: ['sparkles-outline', 'sparkles'],
  progress: ['stats-chart-outline', 'stats-chart'],
};

export default function TabsLayout() {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.backgroundSecondary, borderTopColor: colors.border, height: 64, paddingTop: 6 },
        tabBarLabelStyle: { fontFamily: typography.fontFamily.medium, fontSize: 11, marginBottom: 6 },
        tabBarIcon: ({ color, focused, size }) => {
          const [outline, filled] = icons[route.name] ?? ['ellipse-outline', 'ellipse'];
          return <Ionicons name={focused ? filled : outline} size={size} color={color} />;
        },
        sceneStyle: { backgroundColor: colors.background },
      })}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.home') }} />
      <Tabs.Screen name="workout" options={{ title: t('tabs.workout') }} />
      <Tabs.Screen name="diet" options={{ title: t('tabs.diet') }} />
      <Tabs.Screen name="coach" options={{ title: t('tabs.coach') }} />
      <Tabs.Screen name="progress" options={{ title: t('tabs.progress') }} />
    </Tabs>
  );
}
