import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme';
import { Screen, Text } from '@/components/ui';
import { IconStat, LimeButton, Panel, QuickAction, Ring, chartColors } from '@/components/fitness';
import { useSession } from '@/store/session';
import { todayWorkout, weekly } from '@/features/demo/data';

export default function HomeTab() {
  const { colors } = useTheme();
  const router = useRouter();
  const user = useSession((s) => s.user);
  const firstName = user?.fullName?.split(' ')[0] ?? 'Athlete';
  const pct = weekly.done / weekly.goal;

  return (
    <Screen edges={{ top: true, bottom: false }}>
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <Text variant="bodySmall" tone="secondary">
            Hello, {firstName} 👋
          </Text>
          <Text variant="page" style={{ fontSize: 24, lineHeight: 30 }}>
            Ready to{'\n'}crush your goals?
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          onPress={() => router.push('/(app)/notifications')}
          style={[styles.bell, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Ionicons name="notifications-outline" size={20} color={colors.textPrimary} />
          <View style={[styles.dot, { backgroundColor: chartColors.red }]} />
        </Pressable>
      </View>

      <Panel style={styles.progressPanel}>
        <View style={{ gap: 10 }}>
          <Text variant="caption" tone="secondary">
            Weekly Progress
          </Text>
          <Ring value={pct} size={104} stroke={10}>
            <Text variant="metric">
              {Math.round(pct * 100)}
              <Text variant="caption">%</Text>
            </Text>
            <Text variant="caption" tone="muted">
              {weekly.done}/{weekly.goal}
            </Text>
          </Ring>
        </View>
        <View style={{ flex: 1, gap: 18, justifyContent: 'center' }}>
          <IconStat icon="flame" color={chartColors.orange} label="Calories" value={`${weekly.calories.toLocaleString()}/${weekly.caloriesGoal.toLocaleString()}`} />
          <IconStat icon="timer-outline" color={colors.accent} label="Active Time" value={weekly.activeTime} />
        </View>
      </Panel>

      <View style={styles.sectionRow}>
        <Text variant="bodySmall" weight="semibold">
          Today&apos;s Workout
        </Text>
        <Pressable onPress={() => router.push('/(tabs)/workout')} hitSlop={8}>
          <Text variant="caption" tone="accent" weight="semibold">
            See all
          </Text>
        </Pressable>
      </View>

      <Panel style={styles.workoutCard} onPress={() => router.push('/(tabs)/workout')}>
        <View style={{ flex: 1, gap: 6 }}>
          <Text variant="section">{todayWorkout.name}</Text>
          <Text variant="caption" tone="secondary">
            {todayWorkout.muscles}
          </Text>
          <View style={styles.meta}>
            <Ionicons name="barbell-outline" size={14} color={colors.textPrimary} />
            <Text variant="caption">{todayWorkout.exercises} Exercises</Text>
            <Ionicons name="time-outline" size={14} color={colors.textPrimary} style={{ marginLeft: 8 }} />
            <Text variant="caption">{todayWorkout.minutes} min</Text>
          </View>
          <View style={{ marginTop: 8 }}>
            <LimeButton compact title="Start Workout" onPress={() => router.push('/(tabs)/workout')} />
          </View>
        </View>
        <View style={[styles.hero, { backgroundColor: colors.elevated }]}>
          <Ionicons name="barbell" size={54} color={colors.accent} />
        </View>
      </Panel>

      <Text variant="bodySmall" weight="semibold">
        Quick Actions
      </Text>
      <View style={styles.quickRow}>
        <QuickAction icon="body-outline" label="Exercises" onPress={() => router.push('/(tabs)/workout')} />
        <QuickAction icon="nutrition-outline" label="Nutrition" onPress={() => router.push('/(tabs)/diet')} />
        <QuickAction icon="stats-chart-outline" label="Progress" onPress={() => router.push('/(tabs)/progress')} />
        <QuickAction icon="calendar-outline" label="Calendar" onPress={() => router.push('/(app)/planner')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  bell: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', top: 10, right: 11, width: 8, height: 8, borderRadius: 4 },
  progressPanel: { flexDirection: 'row', gap: 16 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  workoutCard: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  hero: { width: 110, height: 130, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  quickRow: { flexDirection: 'row', gap: 10 },
});
