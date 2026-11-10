import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';
import type { ThemePreference } from '@gymova/shared-types';
import { Card, ListItem, Screen, SegmentedControl, Text } from '@/components/ui';
import { useThemeStore } from '@/theme';
import { setLanguage } from '@/localization/i18n';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);

  return (
    <Screen edges={{ top: false, bottom: true }}>
      <Card>
        <Text variant="label" tone="secondary">
          {t('settings.language')}
        </Text>
        <SegmentedControl
          options={[
            { value: 'en', label: t('settings.english') },
            { value: 'so', label: t('settings.somali') },
          ]}
          value={i18n.language === 'so' ? 'so' : 'en'}
          onChange={(v) => void setLanguage(v as 'en' | 'so')}
        />
      </Card>
      <Card>
        <Text variant="label" tone="secondary">
          {t('settings.theme')}
        </Text>
        <SegmentedControl<ThemePreference>
          options={[
            { value: 'SYSTEM', label: t('settings.themeSystem') },
            { value: 'DARK', label: t('settings.themeDark') },
            { value: 'LIGHT', label: t('settings.themeLight') },
          ]}
          value={preference}
          onChange={setPreference}
        />
      </Card>
      <Card padding={8}>
        <ListItem icon="information-circle-outline" title={t('settings.about')} subtitle={t('settings.version', { version: Constants.expoConfig?.version ?? '1.0.0' })} chevron={false} />
      </Card>
    </Screen>
  );
}
