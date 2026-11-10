import { useTranslation } from 'react-i18next';
import { PlaceholderScreen } from '@/components/Placeholder';

export default function Screen_profile() {
  const { t } = useTranslation();
  return <PlaceholderScreen feature={t('nav.profile')} edges={{ top: false, bottom: true }} />;
}
