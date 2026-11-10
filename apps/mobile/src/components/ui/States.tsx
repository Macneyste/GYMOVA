import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme';
import { Text } from './Text';
import { Button } from './Button';

export function LoadingState({ label, compact = false }: { label?: string; compact?: boolean }) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  return (
    <View style={[styles.center, compact ? { paddingVertical: 24 } : { flex: 1, minHeight: 200 }]} accessibilityRole="progressbar">
      <ActivityIndicator color={colors.accent} size={compact ? 'small' : 'large'} />
      <Text variant="bodySmall" tone="muted">
        {label ?? t('common.loading')}
      </Text>
    </View>
  );
}

export function EmptyState({
  icon = 'sparkles-outline',
  title,
  description,
  actionLabel,
  onAction,
  compact = false,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}) {
  const { colors, radii } = useTheme();
  return (
    <View style={[styles.center, compact ? { paddingVertical: 20 } : { paddingVertical: 48 }]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.elevated, borderRadius: radii.full }]}>
        <Ionicons name={icon} size={28} color={colors.accent} />
      </View>
      <Text variant="section" align="center">
        {title}
      </Text>
      {description ? (
        <Text variant="bodySmall" tone="secondary" align="center" style={{ maxWidth: 300 }}>
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? <Button title={actionLabel} onPress={onAction} fullWidth={false} size="sm" style={{ marginTop: 8 }} /> : null}
    </View>
  );
}

export function ErrorState({
  title,
  description,
  onRetry,
  compact = false,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  const { colors, radii } = useTheme();
  return (
    <View style={[styles.center, compact ? { paddingVertical: 20 } : { paddingVertical: 48 }]} accessibilityLiveRegion="polite">
      <View style={[styles.iconWrap, { backgroundColor: colors.elevated, borderRadius: radii.full }]}>
        <Ionicons name="alert-circle-outline" size={28} color={colors.error} />
      </View>
      <Text variant="section" align="center">
        {title ?? t('common.errorTitle')}
      </Text>
      <Text variant="bodySmall" tone="secondary" align="center" style={{ maxWidth: 300 }}>
        {description ?? t('common.errorDescription')}
      </Text>
      {onRetry ? <Button title={t('common.retry')} onPress={onRetry} fullWidth={false} size="sm" variant="secondary" style={{ marginTop: 8 }} /> : null}
    </View>
  );
}

export function OfflineBanner({ visible }: { visible: boolean }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  if (!visible) return null;
  return (
    <View style={[styles.banner, { backgroundColor: colors.warning }]} accessibilityLiveRegion="polite">
      <Ionicons name="cloud-offline-outline" size={16} color="#101418" />
      <Text variant="caption" style={{ color: '#101418' }} weight="medium">
        {t('common.offline')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 16 },
  iconWrap: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  banner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 6, paddingHorizontal: 12 },
});
