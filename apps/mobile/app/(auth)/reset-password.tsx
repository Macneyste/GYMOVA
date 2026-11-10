import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { resetPasswordSchema, type ResetPasswordInput } from '@gymova/shared-validation';
import { Button, Screen, Text, toast } from '@/components/ui';
import { FormInput } from '@/components/form/FormInput';
import { AuthHeader } from '@/components/form/AuthHeader';
import { api } from '@/services/api';
import { useApiErrorMessage } from '@/hooks/useApiError';
import { useResendCountdown } from '@/hooks/useResendCountdown';

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const errorMessage = useApiErrorMessage();
  const [formError, setFormError] = useState<string | null>(null);
  const resend = useResendCountdown(60);

  const { control, handleSubmit, formState, getValues } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: params.email ?? '', code: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async ({ email, code, password }) => {
    setFormError(null);
    try {
      await api.auth.resetPassword({ email, code, password });
      toast.success(t('auth.resetSuccess'));
      router.dismissTo('/(auth)/login');
    } catch (err) {
      setFormError(errorMessage(err));
    }
  });

  const onResend = async () => {
    try {
      await api.auth.forgotPassword(getValues('email'));
      resend.restart();
      toast.info(t('auth.codeSent'));
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <Screen>
      <AuthHeader title={t('auth.resetTitle')} subtitle={t('auth.resetBody')} />
      <View style={styles.form}>
        <FormInput control={control} name="email" label={t('auth.email')} leftIcon="mail-outline" keyboardType="email-address" autoCapitalize="none" />
        <FormInput
          control={control}
          name="code"
          label={t('auth.code')}
          leftIcon="keypad-outline"
          keyboardType="number-pad"
          maxLength={6}
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
        />
        <FormInput
          control={control}
          name="password"
          label={t('auth.newPassword')}
          helper={t('auth.passwordHint')}
          leftIcon="lock-closed-outline"
          secureTextEntry
          autoComplete="new-password"
        />
        <FormInput control={control} name="confirmPassword" label={t('auth.confirmPassword')} leftIcon="lock-closed-outline" secureTextEntry />
        {formError ? (
          <Text variant="bodySmall" tone="error">
            {formError}
          </Text>
        ) : null}
        <Button title={t('common.save')} size="lg" loading={formState.isSubmitting} onPress={onSubmit} />
        <Button
          title={resend.secondsLeft > 0 ? t('auth.resendIn', { seconds: resend.secondsLeft }) : t('auth.resend')}
          variant="ghost"
          disabled={resend.secondsLeft > 0}
          onPress={onResend}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({ form: { gap: 16 } });
