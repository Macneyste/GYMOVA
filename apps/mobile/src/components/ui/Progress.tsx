import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '@/theme';
import { Text } from './Text';

export function ProgressBar({ value, max = 1, color, height = 8, label }: { value: number; max?: number; color?: string; height?: number; label?: string }) {
  const { colors, radii } = useTheme();
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return (
    <View style={{ gap: 4 }} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(ratio * 100) }}>
      {label ? (
        <Text variant="caption" tone="muted">
          {label}
        </Text>
      ) : null}
      <View style={{ height, backgroundColor: colors.elevated, borderRadius: radii.full, overflow: 'hidden' }}>
        <View style={{ width: `${ratio * 100}%`, height, backgroundColor: color ?? colors.accent, borderRadius: radii.full }} />
      </View>
    </View>
  );
}

export function ProgressRing({
  value,
  max = 1,
  size = 120,
  stroke = 10,
  color,
  children,
}: {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  color?: string;
  children?: React.ReactNode;
}) {
  const { colors } = useTheme();
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(ratio * 100) }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.elevated} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color ?? colors.accent}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={c * (1 - ratio)}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      {children}
    </View>
  );
}

export function Metric({
  label,
  value,
  unit,
  target,
  tone = 'accent',
  size = 'md',
}: {
  label: string;
  value: string | number;
  unit?: string;
  target?: string | number | null;
  tone?: 'accent' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
}) {
  const { colors, radii } = useTheme();
  return (
    <View style={[styles.metric, { backgroundColor: colors.elevated, borderRadius: radii.md }]}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
        <Text variant={size === 'sm' ? 'section' : 'metric'} tone={tone}>
          {value}
        </Text>
        {unit ? (
          <Text variant="caption" tone="muted" style={{ marginBottom: 4 }}>
            {unit}
          </Text>
        ) : null}
      </View>
      <Text variant="caption" tone="secondary">
        {label}
        {target !== undefined && target !== null ? ` / ${target}` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  metric: { flex: 1, padding: 12, gap: 2, minWidth: 90 },
});
