import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { otpSchema, type z } from '@gymova/shared-validation';
import { Button, Screen, Text, toast } from '@/components/ui';
import { FormInput } from '@/components/form/FormInput';
import { AuthHeader } from '@/components/form/AuthHeader';
import { api } from '@/services/api';
import { useSession } from '@/store/session';
import { useApiErrorMessage } from '@/hooks/useApiError';
import { useResendCountdown } from '@/hooks/useResendCountdown';

type OtpForm = z.infer<typeof otpSchema>;

export default function VerifyEmailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useSession((s) => s.user);
  const setUser = useSession((s) => s.setUser);
  const errorMessage = useApiErrorMessage();
  const [formError, setFormError] = useState<string | null>(null);
  const resend = useResendCountdown(60);

  const { control, handleSubmit, formState, reset } = useForm<OtpForm>({ resolver: zodResolver(otpSchema), defaultValues: { code: '' } });

  const finish = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)'));

  const onSubmit = handleSubmit(async ({ code }) => {
    setFormError(null);
    try {
      const updated = await api.auth.verifyEmail(code);
      await setUser(updated);
      toast.success(t('auth.verified'));
      finish();
    } catch (err) {
      reset({ code: '' });
      setFormError(errorMessage(err));
    }
  });

  const onResend = async () => {
    try {
      await api.auth.resendVerification('EMAIL_VERIFY');
      resend.restart();
      toast.info(t('auth.codeSent'));
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <AuthHeader title={t('auth.verifyTitle')} subtitle={t('auth.verifyBody', { target: user?.email ?? '' })} back={false} />
      <View style={styles.form}>
        <FormInput
          control={control}
          name="code"
          label={t('auth.code')}
          leftIcon="keypad-outline"
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
        />
        {formError ? (
          <Text variant="bodySmall" tone="error">
            {formError}
          </Text>
        ) : null}
        <Button title={t('common.confirm')} size="lg" loading={formState.isSubmitting} onPress={onSubmit} />
        <Button
          title={resend.secondsLeft > 0 ? t('auth.resendIn', { seconds: resend.secondsLeft }) : t('auth.resend')}
          variant="ghost"
          disabled={resend.secondsLeft > 0}
          onPress={onResend}
        />
        <Button title={t('auth.skipForNow')} variant="ghost" onPress={() => router.replace('/(tabs)')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({ form: { gap: 16 } });
