import { useTranslation } from 'react-i18next';
import { PlaceholderScreen } from '@/components/Placeholder';

export default function TrainersScreen() {
  const { t } = useTranslation();
  return <PlaceholderScreen feature={t('nav.trainers')} edges={{ top: false, bottom: true }} />;
}
