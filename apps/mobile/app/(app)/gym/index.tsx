import { useTranslation } from 'react-i18next';
import { PlaceholderScreen } from '@/components/Placeholder';

export default function GymScreen() {
  const { t } = useTranslation();
  return <PlaceholderScreen feature={t('nav.gym')} edges={{ top: false, bottom: true }} />;
}
