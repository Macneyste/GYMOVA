import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { Screen, Text } from '@/components/ui';
import { LimeButton, MediaRow, Panel, PillTabs, ScreenHeader } from '@/components/fitness';
import { exerciseLibrary, pushDayExercises, todayWorkout, type Exercise } from '@/features/demo/data';

type View_ = 'plan' | 'library';
type Group = 'All' | Exercise['group'];
const groups: Group[] = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms'];

export default function WorkoutTab() {
  const [view, setView] = useState<View_>('plan');
  return (
    <Screen edges={{ top: true, bottom: false }}>
      <ScreenHeader title={view === 'plan' ? 'Workout' : 'Exercise Library'} />
      <PillTabs
        options={[
          { value: 'plan', label: "Today's Plan" },
          { value: 'library', label: 'Exercise Library' },
        ]}
        value={view}
        onChange={setView}
      />
      {view === 'plan' ? <TodayPlan /> : <Library />}
    </Screen>
  );
}

function TodayPlan() {
  const { colors } = useTheme();
  return (
    <>
      <View style={[styles.hero, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.heroArt, { backgroundColor: colors.elevated }]}>
          <Ionicons name="barbell" size={86} color={colors.accent} style={{ opacity: 0.9 }} />
        </View>
        <View style={{ padding: 16, gap: 4 }}>
          <Text variant="page" style={{ fontSize: 24 }}>
            {todayWorkout.name}
          </Text>
          <Text variant="caption" tone="secondary">
            {todayWorkout.muscles}
          </Text>
        </View>
      </View>

      <Panel style={styles.stats}>
        <Stat value={`${todayWorkout.exercises}`} label="Exercises" />
        <View style={[styles.sep, { backgroundColor: colors.border }]} />
        <Stat value={`${todayWorkout.minutes}`} unit="min" label="Duration" />
        <View style={[styles.sep, { backgroundColor: colors.border }]} />
        <Stat value={`${todayWorkout.calories}`} label="Calories" />
      </Panel>

      <LimeButton title="Start Workout" />

      <Text variant="bodySmall" weight="semibold">
        Exercises ({pushDayExercises.length})
      </Text>
      <View style={{ gap: 10 }}>
        {pushDayExercises.map((e) => (
          <MediaRow key={e.name} icon={e.icon} title={e.name} subtitle={`${e.sets} Sets x ${e.reps} Reps`} trailing="menu" />
        ))}
      </View>
    </>
  );
}

function Stat({ value, unit, label }: { value: string; unit?: string; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
      <Text variant="section">
        {value}
        {unit ? <Text variant="caption"> {unit}</Text> : null}
      </Text>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
    </View>
  );
}

function Library() {
  const { colors, typography } = useTheme();
  const [q, setQ] = useState('');
  const [group, setGroup] = useState<Group>('Chest');
  const list = useMemo(
    () => exerciseLibrary.filter((e) => (group === 'All' || e.group === group) && e.name.toLowerCase().includes(q.trim().toLowerCase())),
    [q, group],
  );
  return (
    <>
      <View style={styles.searchRow}>
        <View style={[styles.search, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search" size={16} color={colors.textMuted} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search exercises..."
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.accent}
            style={{ flex: 1, color: colors.textPrimary, fontFamily: typography.fontFamily.regular, fontSize: 14, paddingVertical: 10 }}
          />
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Filter" style={[styles.filter, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="options-outline" size={18} color={colors.textPrimary} />
        </Pressable>
      </View>
      <PillTabs scroll options={groups.map((g) => ({ value: g, label: g }))} value={group} onChange={setGroup} />
      <View style={{ gap: 10 }}>
        {list.map((e) => (
          <MediaRow key={e.name} icon={e.icon} title={e.name} subtitle={e.group} />
        ))}
        {list.length === 0 ? (
          <Text variant="bodySmall" tone="muted" align="center" style={{ paddingVertical: 24 }}>
            No exercises found
          </Text>
        ) : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  heroArt: { height: 150, alignItems: 'center', justifyContent: 'center' },
  stats: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  sep: { width: 1, height: 32 },
  searchRow: { flexDirection: 'row', gap: 10 },
  search: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12 },
  filter: { width: 44, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
