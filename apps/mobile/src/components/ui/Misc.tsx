import { Image, Modal, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { touchTarget } from '@gymova/design-tokens';
import { useTheme } from '@/theme';
import { Text } from './Text';

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  return <View style={[{ height: 1, backgroundColor: colors.border }, style]} />;
}

export function Badge({ label, tone = 'accent' }: { label: string; tone?: 'accent' | 'success' | 'warning' | 'error' | 'muted' }) {
  const { colors, radii } = useTheme();
  const bg = { accent: colors.accent, success: colors.success, warning: colors.warning, error: colors.error, muted: colors.elevated }[tone];
  const fg = tone === 'muted' ? colors.textSecondary : '#101418';
  return (
    <View style={{ backgroundColor: bg, borderRadius: radii.full, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' }}>
      <Text variant="caption" weight="semibold" style={{ color: fg }}>
        {label}
      </Text>
    </View>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
  tone = 'secondary',
  size = touchTarget,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  label: string;
  tone?: 'primary' | 'secondary' | 'ghost';
  size?: number;
}) {
  const { colors, radii } = useTheme();
  const bg = tone === 'primary' ? colors.accent : tone === 'secondary' ? colors.elevated : 'transparent';
  const fg = tone === 'primary' ? '#101418' : colors.textPrimary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => ({ width: size, height: size, borderRadius: radii.md, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.8 : 1 })}
    >
      <Ionicons name={icon} size={22} color={fg} />
    </Pressable>
  );
}

export function Avatar({ uri, name, size = 44 }: { uri?: string | null; name: string; size?: number }) {
  const { colors } = useTheme();
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
  if (uri) return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} accessibilityLabel={name} />;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.elevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}>
      <Text variant="label" tone="accent">
        {initials || '?'}
      </Text>
    </View>
  );
}

export function ListItem({
  title,
  subtitle,
  icon,
  right,
  onPress,
  chevron = true,
  destructive = false,
}: {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  right?: React.ReactNode;
  onPress?: () => void;
  chevron?: boolean;
  destructive?: boolean;
}) {
  const { colors, radii } = useTheme();
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.listItem, { backgroundColor: pressed ? colors.elevated : 'transparent', borderRadius: radii.sm }]}
    >
      {icon ? (
        <View style={{ width: 36, height: 36, borderRadius: radii.sm, backgroundColor: colors.elevated, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={icon} size={18} color={destructive ? colors.error : colors.accent} />
        </View>
      ) : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="body" tone={destructive ? 'error' : 'primary'}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
      {onPress && chevron ? <Ionicons name="chevron-forward" size={18} color={colors.textMuted} /> : null}
    </Pressable>
  );
}

export function SheetModal({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title?: string; children: React.ReactNode }) {
  const { colors, radii } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
      <View style={[styles.sheet, { backgroundColor: colors.card, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, paddingBottom: insets.bottom + 16 }]}>
        <View style={[styles.handle, { backgroundColor: colors.border }]} />
        {title ? (
          <Text variant="section" style={{ marginBottom: 8 }}>
            {title}
          </Text>
        ) : null}
        {children}
      </View>
    </Modal>
  );
}

export function SectionHeader({ title, actionLabel, onAction, href }: { title: string; actionLabel?: string; onAction?: () => void; href?: string }) {
  const router = useRouter();
  return (
    <View style={styles.sectionHeader}>
      <Text variant="section">{title}</Text>
      {actionLabel ? (
        <Pressable accessibilityRole="button" onPress={onAction ?? (href ? () => router.push(href as never) : undefined)} hitSlop={8}>
          <Text variant="label" tone="accent">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  listItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 4, minHeight: touchTarget },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: { padding: 20, gap: 12, maxHeight: '88%' },
  handle: { width: 44, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 4 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
