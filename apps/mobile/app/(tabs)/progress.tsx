import { useTranslation } from 'react-i18next';
import { PlaceholderScreen } from '@/components/Placeholder';

export default function ProgressTab() {
  const { t } = useTranslation();
  return <PlaceholderScreen feature={t('tabs.progress')} edges={{ top: true, bottom: false }} />;
}
