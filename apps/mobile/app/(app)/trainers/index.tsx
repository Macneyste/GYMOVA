import { Screen } from '@/components/ui';
import { TrainerProfile } from '@/components/fitness/TrainerProfile';

export default function TrainersScreen() {
  return (
    <Screen edges={{ top: false, bottom: true }}>
      <TrainerProfile />
    </Screen>
  );
}
