import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { IconButton, Text } from '@/components/ui';

/** Back button + title + subtitle used at the top of every auth form. */
export function AuthHeader({ title, subtitle, back = true }: { title: string; subtitle?: string; back?: boolean }) {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <View style={styles.wrap}>
      {back && router.canGoBack() ? <IconButton icon="arrow-back" label={t('common.back')} tone="ghost" onPress={() => router.back()} /> : null}
      <Text variant="page" style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {subtitle ? (
        <Text variant="body" tone="secondary">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, marginBottom: 24 },
  title: { marginTop: 8 },
});
