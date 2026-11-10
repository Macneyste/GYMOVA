import { useTranslation } from 'react-i18next';
import { PlaceholderScreen } from '@/components/Placeholder';

export default function WorkoutTab() {
  const { t } = useTranslation();
  return <PlaceholderScreen feature={t('tabs.workout')} edges={{ top: true, bottom: false }} />;
}
