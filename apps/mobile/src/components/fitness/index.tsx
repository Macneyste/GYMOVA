/**
 * Visual building blocks for the "Gym UI Kit" look: dark cards, lime accents,
 * ring + bar + area charts, exercise rows and quick-action tiles.
 */
import { Pressable, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { useTheme } from '@/theme';
import { Text } from '@/components/ui';

type IconName = keyof typeof Ionicons.glyphMap;

/** Chart / macro colours used alongside the lime accent. */
export const chartColors = {
  orange: '#F5793B',
  purple: '#A46CF5',
  yellow: '#F2C94C',
  red: '#EF5A5A',
};

/** Top bar of secondary-style screens: back arrow, centered-left title, more button. */
export function ScreenHeader({ title, back = false, onMore }: { title: string; back?: boolean; onMore?: () => void }) {
  const { colors } = useTheme();
  const router = useRouter();
  return (
    <View style={styles.header}>
      {back ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
      ) : null}
      <Text variant="section" style={{ flex: 1, fontSize: 18 }}>
        {title}
      </Text>
      <Pressable accessibilityRole="button" accessibilityLabel="More" onPress={onMore} hitSlop={10}>
        <Ionicons name="ellipsis-horizontal" size={22} color={colors.textPrimary} />
      </Pressable>
    </View>
  );
}

/** Dark rounded panel used across every screen. */
export function Panel({ children, style, onPress }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  const { colors } = useTheme();
  const base = [styles.panel, { backgroundColor: colors.card, borderColor: colors.border }, style];
  if (onPress)
    return (
      <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [base, { opacity: pressed ? 0.9 : 1 }]}>
        {children}
      </Pressable>
    );
  return <View style={base}>{children}</View>;
}

/** Ring with a gradient-free arc; children render in the centre. */
export function Ring({
  value,
  size = 110,
  stroke = 10,
  color,
  track,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: React.ReactNode;
}) {
  const { colors } = useTheme();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const ratio = Math.max(0, Math.min(1, value));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track ?? colors.elevated} strokeWidth={stroke} fill="none" />
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

/** Multi-segment ring (nutrition: protein / carbs / fat). */
export function SegmentRing({ segments, size = 150, stroke = 12, children }: { segments: { value: number; color: string }[]; size?: number; stroke?: number; children?: React.ReactNode }) {
  const { colors } = useTheme();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const gap = 6;
  let offset = 0;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.elevated} strokeWidth={stroke} fill="none" />
        {segments.map((s, i) => {
          const len = Math.max(0, (s.value / total) * c - gap);
          const el = (
            <Circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke={s.color}
              strokeWidth={stroke}
              fill="none"
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              rotation={-90}
              origin={`${size / 2}, ${size / 2}`}
            />
          );
          offset += (s.value / total) * c;
          return el;
        })}
      </Svg>
      {children}
    </View>
  );
}

/** Small icon tile + label/value (e.g. Calories 2,350/3,000). */
export function IconStat({ icon, color, label, value }: { icon: IconName; color: string; label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.iconStat}>
      <View style={[styles.iconBox, { backgroundColor: colors.elevated }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="caption" tone="muted">
          {label}
        </Text>
        <Text variant="bodySmall" weight="bold">
          {value}
        </Text>
      </View>
    </View>
  );
}

/** Rounded square tile with an icon and caption (Quick Actions). */
export function QuickAction({ icon, label, onPress }: { icon: IconName; label: string; onPress?: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.quick, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 }]}>
      <Ionicons name={icon} size={20} color={chartColors.orange} />
      <Text variant="caption" tone="secondary" numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Thumbnail block standing in for exercise / meal photos. */
export function Thumb({ icon, size = 52, tint }: { icon: IconName; size?: number; tint?: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ width: size, height: size, borderRadius: 12, backgroundColor: colors.elevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}>
      <Ionicons name={icon} size={size * 0.45} color={tint ?? colors.accent} />
    </View>
  );
}

/** Row with thumbnail, title, subtitle and a trailing element (chevron / menu / kcal). */
export function MediaRow({
  icon,
  tint,
  title,
  subtitle,
  trailing = 'chevron',
  onPress,
}: {
  icon: IconName;
  tint?: string;
  title: string;
  subtitle?: string;
  trailing?: 'chevron' | 'menu' | React.ReactNode;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={({ pressed }) => [styles.mediaRow, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.9 : 1 }]}
    >
      <Thumb icon={icon} tint={tint} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodySmall" weight="semibold">
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing === 'chevron' ? (
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      ) : trailing === 'menu' ? (
        <Ionicons name="ellipsis-vertical" size={18} color={colors.textMuted} />
      ) : (
        trailing
      )}
    </Pressable>
  );
}

/** Weekly bar chart with highlighted bar + value bubble. */
export function BarChart({ data, highlight }: { data: { label: string; value: number }[]; highlight?: number }) {
  const { colors } = useTheme();
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <View style={styles.bars}>
      {data.map((d, i) => {
        const active = i === highlight;
        const h = Math.max(6, (d.value / max) * 70);
        return (
          <View key={d.label} style={styles.barCol}>
            {active ? (
              <View style={[styles.bubble, { backgroundColor: colors.accent }]}>
                <Text variant="caption" weight="bold" style={{ color: '#0A0B0D', fontSize: 10, lineHeight: 12 }}>
                  {d.value}
                </Text>
              </View>
            ) : null}
            <View style={{ width: 10, height: h, borderRadius: 5, backgroundColor: d.value === 0 ? colors.elevated : active ? colors.accent : colors.accentSecondary }} />
            <Text variant="caption" tone="muted" style={{ fontSize: 10 }}>
              {d.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

/** Smooth area sparkline. */
export function AreaChart({ points, color, width = 140, height = 60 }: { points: number[]; color: string; width?: number; height?: number }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const step = width / (points.length - 1);
  const xy = points.map((p, i) => [i * step, height - 6 - ((p - min) / (max - min || 1)) * (height - 12)] as const);
  let line = `M ${xy[0][0]} ${xy[0][1]}`;
  for (let i = 1; i < xy.length; i++) {
    const [x0, y0] = xy[i - 1];
    const [x1, y1] = xy[i];
    const cx = (x0 + x1) / 2;
    line += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
  }
  const area = `${line} L ${width} ${height} L 0 ${height} Z`;
  const id = `g${color.replace('#', '')}`;
  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={0.45} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Path d={area} fill={`url(#${id})`} />
      <Path d={line} stroke={color} strokeWidth={2} fill="none" />
    </Svg>
  );
}

/** Pill tab row (Overview / Workouts / Body Stats, All / Chest / Back …). */
export function PillTabs<T extends string>({ options, value, onChange, scroll = false }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; scroll?: boolean }) {
  const { colors } = useTheme();
  const items = options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.value)}
            style={[
              styles.pill,
              scroll ? { flex: 0, paddingHorizontal: 14, borderWidth: 1, borderColor: active ? colors.accent : colors.border } : null,
              { backgroundColor: active ? colors.accent : scroll ? colors.card : 'transparent' },
            ]}
          >
            <Text variant="caption" weight={active ? 'semibold' : 'medium'} style={{ color: active ? '#0A0B0D' : colors.textSecondary }}>
              {o.label}
            </Text>
          </Pressable>
        );
      });
  if (scroll)
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
        {items}
      </ScrollView>
    );
  return <View style={[styles.pills, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, padding: 4 }]}>{items}</View>;
}

/** Lime pill CTA with trailing/leading play icon. */
export function LimeButton({ title, icon = 'play', onPress, compact = false }: { title: string; icon?: IconName; onPress?: () => void; compact?: boolean }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.lime, compact ? { alignSelf: 'flex-start', paddingHorizontal: 16, minHeight: 38 } : null, { backgroundColor: colors.accent, opacity: pressed ? 0.85 : 1 }]}
    >
      <Ionicons name={icon} size={16} color="#0A0B0D" />
      <Text variant="bodySmall" weight="bold" style={{ color: '#0A0B0D' }}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 40 },
  panel: { borderWidth: 1, borderRadius: 18, padding: 16, gap: 10 },
  iconStat: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  quick: { flex: 1, borderWidth: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  mediaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 14, borderWidth: 1 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 110, paddingTop: 20 },
  barCol: { alignItems: 'center', gap: 6, flex: 1, justifyContent: 'flex-end' },
  bubble: { borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1, marginBottom: 2 },
  pills: { flexDirection: 'row', gap: 6, borderRadius: 12 },
  pill: { flex: 1, minHeight: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  lime: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 48, borderRadius: 14, paddingHorizontal: 18 },
});
