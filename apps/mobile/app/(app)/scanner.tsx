import { useTranslation } from 'react-i18next';
import { PlaceholderScreen } from '@/components/Placeholder';

export default function Screen_scanner() {
  const { t } = useTranslation();
  return <PlaceholderScreen feature={t('nav.scanner')} edges={{ top: false, bottom: true }} />;
}
