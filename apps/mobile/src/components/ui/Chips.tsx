import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { Text } from './Text';

export interface ChipOption<T extends string = string> {
  value: T;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function Chip({ label, selected = false, onPress, icon }: { label: string; selected?: boolean; onPress?: () => void; icon?: keyof typeof Ionicons.glyphMap }) {
  const { colors, radii } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.accent : colors.elevated,
          borderColor: selected ? colors.accent : colors.border,
          borderRadius: radii.full,
        },
      ]}
    >
      {icon ? <Ionicons name={icon} size={14} color={selected ? '#101418' : colors.textSecondary} /> : null}
      <Text variant="label" style={{ color: selected ? '#101418' : colors.textPrimary }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  multiple = false,
  scroll = false,
}: {
  options: ChipOption<T>[];
  value: T | T[] | null;
  onChange: (next: T | T[]) => void;
  multiple?: boolean;
  scroll?: boolean;
}) {
  const selected = new Set(Array.isArray(value) ? value : value ? [value] : []);
  const toggle = (v: T) => {
    if (!multiple) return onChange(v);
    const next = new Set(selected);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    onChange([...next] as T[]);
  };
  const content = options.map((o) => <Chip key={o.value} label={o.label} icon={o.icon} selected={selected.has(o.value)} onPress={() => toggle(o.value)} />);
  if (scroll) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {content}
      </ScrollView>
    );
  }
  return <View style={[styles.row, { flexWrap: 'wrap' }]}>{content}</View>;
}

export function SegmentedControl<T extends string>({ options, value, onChange }: { options: ChipOption<T>[]; value: T; onChange: (v: T) => void }) {
  const { colors, radii } = useTheme();
  return (
    <View style={[styles.segment, { backgroundColor: colors.elevated, borderRadius: radii.sm }]} accessibilityRole="tablist">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.value)}
            style={[styles.segmentItem, { backgroundColor: active ? colors.card : 'transparent', borderRadius: radii.xs }]}
          >
            <Text variant="label" tone={active ? 'primary' : 'muted'} align="center">
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, minHeight: 38, borderWidth: 1 },
  row: { flexDirection: 'row', gap: 8 },
  segment: { flexDirection: 'row', padding: 4, gap: 4 },
  segmentItem: { flex: 1, minHeight: 36, alignItems: 'center', justifyContent: 'center' },
});
