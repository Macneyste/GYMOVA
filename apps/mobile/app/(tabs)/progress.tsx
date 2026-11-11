import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { Screen, Text } from '@/components/ui';
import { AreaChart, BarChart, Panel, PillTabs, Ring, chartColors } from '@/components/fitness';
import { activeTrend, caloriesTrend, goal, weekly, workoutFrequency } from '@/features/demo/data';

type Tab = 'overview' | 'workouts' | 'body';

export default function ProgressTab() {
  const { colors } = useTheme();
  const [tab, setTab] = useState<Tab>('overview');
  const total = workoutFrequency.reduce((s, d) => s + (d.value > 0 ? 1 : 0), 0);
  const peak = workoutFrequency.reduce((best, d, i, arr) => (d.value > arr[best].value ? i : best), 0);

  return (
    <Screen edges={{ top: true, bottom: false }}>
      <Text variant="section" style={{ fontSize: 18 }}>
        Progress
      </Text>
      <PillTabs
        options={[
          { value: 'overview', label: 'Overview' },
          { value: 'workouts', label: 'Workouts' },
          { value: 'body', label: 'Body Stats' },
        ]}
        value={tab}
        onChange={setTab}
      />

      <Pressable style={[styles.select, { backgroundColor: colors.card, borderColor: colors.border }]} accessibilityRole="button">
        <Text variant="bodySmall">This Week</Text>
        <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
      </Pressable>

      <Panel>
        <View style={styles.rowBetween}>
          <Text variant="caption" weight="semibold">
            Workout Frequency
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </View>
        <Text variant="metric">{total}</Text>
        <Text variant="caption" tone="muted" style={{ marginTop: -8 }}>
          Workouts
        </Text>
        <BarChart data={workoutFrequency} highlight={peak} />
      </Panel>

      <View style={styles.twoCol}>
        <Panel style={{ flex: 1 }}>
          <Text variant="caption" weight="semibold">
            Calories Burned
          </Text>
          <Text variant="section">
            {weekly.calories.toLocaleString()}
          </Text>
          <Text variant="caption" tone="muted" style={{ marginTop: -8 }}>
            kcal
          </Text>
          <AreaChart points={caloriesTrend} color={chartColors.orange} />
        </Panel>
        <Panel style={{ flex: 1 }}>
          <View style={styles.rowBetween}>
            <Text variant="caption" weight="semibold">
              Active Time
            </Text>
            <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
          </View>
          <Text variant="section">{weekly.activeTime}</Text>
          <Text variant="caption" tone="muted" style={{ marginTop: -8 }}>
            {' '}
          </Text>
          <AreaChart points={activeTrend} color={chartColors.purple} />
        </Panel>
      </View>

      <Panel>
        <View style={styles.rowBetween}>
          <View style={{ gap: 4, flex: 1 }}>
            <Text variant="caption" tone="secondary">
              Goal Progress
            </Text>
            <Text variant="section">{goal.name}</Text>
            <Text variant="caption" tone="muted">
              {goal.done} of {goal.total} workouts
            </Text>
          </View>
          <Ring value={goal.done / goal.total} size={64} stroke={6} color={chartColors.yellow}>
            <Text variant="caption" weight="bold">
              {Math.round((goal.done / goal.total) * 100)}%
            </Text>
          </Ring>
        </View>
        <View style={[styles.track, { backgroundColor: colors.elevated }]}>
          <View style={[styles.fill, { width: `${(goal.done / goal.total) * 100}%`, backgroundColor: colors.accent }]} />
        </View>
      </Panel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  select: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, minHeight: 42 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  twoCol: { flexDirection: 'row', gap: 12 },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
});
