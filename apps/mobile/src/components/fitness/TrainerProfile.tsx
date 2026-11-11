import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { Text } from '@/components/ui';
import { trainer } from '@/features/demo/data';
import { LimeButton, Panel } from './index';

/** Trainer profile card: avatar, rating, stats, about, specializations and message CTA. */
export function TrainerProfile({ onMessage }: { onMessage?: () => void }) {
  const { colors } = useTheme();
  const initials = trainer.name
    .split(' ')
    .map((p) => p[0])
    .join('');
  return (
    <>
      <Panel style={styles.top}>
        <View style={[styles.avatar, { backgroundColor: colors.elevated, borderColor: colors.accent }]}>
          <Text variant="page" tone="accent">
            {initials}
          </Text>
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text variant="section">{trainer.name}</Text>
          <Text variant="caption" tone="secondary">
            {trainer.title}
          </Text>
          <View style={styles.rating}>
            <Ionicons name="star" size={14} color="#F2C94C" />
            <Text variant="caption" weight="semibold">
              {trainer.rating}
            </Text>
            <Text variant="caption" tone="muted">
              ({trainer.reviews} Reviews)
            </Text>
          </View>
        </View>
      </Panel>

      <Panel style={styles.stats}>
        <Stat value={`${trainer.years}`} label="Years Exp." />
        <View style={[styles.sep, { backgroundColor: colors.border }]} />
        <Stat value={trainer.clients} label="Clients" />
        <View style={[styles.sep, { backgroundColor: colors.border }]} />
        <Stat value={trainer.programs} label="Programs" />
      </Panel>

      <View style={{ gap: 6 }}>
        <Text variant="bodySmall" weight="semibold">
          About Me
        </Text>
        <Text variant="caption" tone="secondary">
          {trainer.about}
        </Text>
      </View>

      <View style={{ gap: 10 }}>
        <Text variant="bodySmall" weight="semibold">
          Specializations
        </Text>
        <View style={styles.specs}>
          {trainer.specializations.map((s) => (
            <View key={s.label} style={[styles.spec, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name={s.icon} size={20} color={colors.accent} />
              <Text variant="caption" tone="secondary" style={{ fontSize: 10 }} numberOfLines={1}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <LimeButton title="Message Trainer" icon="chatbubble-ellipses-outline" onPress={onMessage} />
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
      <Text variant="section">{value}</Text>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 76, height: 76, borderRadius: 38, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stats: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  sep: { width: 1, height: 32 },
  specs: { flexDirection: 'row', gap: 10 },
  spec: { flex: 1, borderWidth: 1, borderRadius: 14, alignItems: 'center', gap: 6, paddingVertical: 12 },
});
