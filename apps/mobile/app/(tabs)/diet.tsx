import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { Screen, Text } from '@/components/ui';
import { MediaRow, Panel, ScreenHeader, SegmentRing } from '@/components/fitness';
import { nutrition } from '@/features/demo/data';

function dayLabel(offset: number) {
  if (offset === 0) return 'Today';
  if (offset === -1) return 'Yesterday';
  if (offset === 1) return 'Tomorrow';
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function DietTab() {
  const { colors } = useTheme();
  const [offset, setOffset] = useState(0);

  return (
    <Screen edges={{ top: true, bottom: false }}>
      <ScreenHeader title="Nutrition" />

      <View style={[styles.dateBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Previous day" onPress={() => setOffset((o) => o - 1)} hitSlop={10}>
          <Ionicons name="chevron-back" size={18} color={colors.textPrimary} />
        </Pressable>
        <Text variant="bodySmall" weight="semibold">
          {dayLabel(offset)}
        </Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Next day" onPress={() => setOffset((o) => o + 1)} hitSlop={10}>
          <Ionicons name="chevron-forward" size={18} color={colors.textPrimary} />
        </Pressable>
      </View>

      <Panel style={styles.summary}>
        <SegmentRing size={150} stroke={12} segments={nutrition.macros.map((m) => ({ value: m.value, color: m.color }))}>
          <Text variant="metric">{nutrition.consumed.toLocaleString()}</Text>
          <Text variant="caption" tone="muted">
            / {nutrition.goal.toLocaleString()} kcal
          </Text>
          <Text variant="caption" tone="secondary">
            Consumed
          </Text>
        </SegmentRing>
        <View style={{ flex: 1, gap: 14 }}>
          {nutrition.macros.map((m) => (
            <View key={m.key} style={styles.macro}>
              <View style={[styles.macroIcon, { backgroundColor: colors.elevated }]}>
                <Ionicons name={m.icon} size={14} color={m.color} />
              </View>
              <View>
                <Text variant="caption" tone="secondary">
                  {m.label}
                </Text>
                <Text variant="caption" weight="bold" style={{ color: m.color }}>
                  {m.value}g <Text variant="caption" tone="muted">/ {m.goal}g</Text>
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Panel>

      <View style={styles.rowBetween}>
        <Text variant="bodySmall" weight="semibold">
          Meals
        </Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Add meal" style={[styles.add, { backgroundColor: colors.accent }]}>
          <Ionicons name="add" size={18} color="#0A0B0D" />
        </Pressable>
      </View>

      <View style={{ gap: 10 }}>
        {nutrition.meals.map((m) => (
          <MediaRow
            key={m.name}
            icon={m.icon}
            tint="#F5793B"
            title={m.name}
            subtitle={m.food}
            trailing={
              <Text variant="caption" weight="semibold">
                {m.kcal} kcal
              </Text>
            }
          />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  dateBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, minHeight: 44 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  macro: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  macroIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  add: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
});
