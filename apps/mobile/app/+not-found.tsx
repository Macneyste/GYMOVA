import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, EmptyState, Screen } from '@/components/ui';

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <Screen>
      <EmptyState icon="compass-outline" title={t('common.notFound')} />
      <Link href="/(tabs)" asChild>
        <Button title={t('tabs.home')} />
      </Link>
    </Screen>
  );
}
