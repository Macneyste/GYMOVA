import { useTranslation } from 'react-i18next';
import { PlaceholderScreen } from '@/components/Placeholder';

export default function Screen_challenges() {
  const { t } = useTranslation();
  return <PlaceholderScreen feature={t('nav.challenges')} edges={{ top: false, bottom: true }} />;
}
