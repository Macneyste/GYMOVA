import { useTranslation } from 'react-i18next';
import { PlaceholderScreen } from '@/components/Placeholder';

export default function DietTab() {
  const { t } = useTranslation();
  return <PlaceholderScreen feature={t('tabs.diet')} edges={{ top: true, bottom: false }} />;
}
