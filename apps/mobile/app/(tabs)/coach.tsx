import { useTranslation } from 'react-i18next';
import { PlaceholderScreen } from '@/components/Placeholder';

export default function CoachTab() {
  const { t } = useTranslation();
  return <PlaceholderScreen feature={t('tabs.coach')} edges={{ top: true, bottom: false }} />;
}
