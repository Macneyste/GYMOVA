import { useTranslation } from 'react-i18next';
import { PlaceholderScreen } from '@/components/Placeholder';

export default function Screen_notifications() {
  const { t } = useTranslation();
  return <PlaceholderScreen feature={t('nav.notifications')} edges={{ top: false, bottom: true }} />;
}
