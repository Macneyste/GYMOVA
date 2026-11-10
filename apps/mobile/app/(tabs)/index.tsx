import { useTranslation } from 'react-i18next';
import { PlaceholderScreen } from '@/components/Placeholder';

export default function HomeTab() {
  const { t } = useTranslation();
  return <PlaceholderScreen feature={t('tabs.home')} edges={{ top: true, bottom: false }} />;
}
