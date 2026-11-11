import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/ui';
import { ScreenHeader } from '@/components/fitness';
import { TrainerProfile } from '@/components/fitness/TrainerProfile';

export default function CoachTab() {
  const { t } = useTranslation();
  return (
    <Screen edges={{ top: true, bottom: false }}>
      <ScreenHeader title={t('tabs.coach')} />
      <TrainerProfile />
    </Screen>
  );
}
