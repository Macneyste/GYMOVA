import { useTranslation } from 'react-i18next';
import { PlaceholderScreen } from '@/components/Placeholder';

export default function Screen_planner() {
  const { t } = useTranslation();
  return <PlaceholderScreen feature={t('nav.planner')} edges={{ top: false, bottom: true }} />;
}
