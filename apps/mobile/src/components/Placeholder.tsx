import { useTranslation } from 'react-i18next';
import { EmptyState, Screen } from '@/components/ui';

/** Temporary content for screens whose phase has not shipped yet. Replaced phase by phase. */
export function PlaceholderScreen({ feature, edges }: { feature: string; edges?: { top?: boolean; bottom?: boolean } }) {
  const { t } = useTranslation();
  return (
    <Screen edges={edges}>
      <EmptyState icon="construct-outline" title={t('placeholder.title', { feature })} description={t('placeholder.body')} />
    </Screen>
  );
}
