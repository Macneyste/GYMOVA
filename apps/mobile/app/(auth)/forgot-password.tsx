import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { forgotPasswordSchema, type z } from '@gymova/shared-validation';
import { Button, Screen, Text } from '@/components/ui';
import { FormInput } from '@/components/form/FormInput';
import { AuthHeader } from '@/components/form/AuthHeader';
import { api } from '@/services/api';
import { useApiErrorMessage } from '@/hooks/useApiError';

type ForgotForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const errorMessage = useApiErrorMessage();
  const [formError, setFormError] = useState<string | null>(null);
  const { control, handleSubmit, formState } = useForm<ForgotForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    setFormError(null);
    try {
      await api.auth.forgotPassword(email);
      router.push({ pathname: '/(auth)/reset-password', params: { email } });
    } catch (err) {
      setFormError(errorMessage(err));
    }
  });

  return (
    <Screen>
      <AuthHeader title={t('auth.forgotTitle')} subtitle={t('auth.forgotBody')} />
      <View style={styles.form}>
        <FormInput
          control={control}
          name="email"
          label={t('auth.email')}
          leftIcon="mail-outline"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          returnKeyType="send"
          onSubmitEditing={onSubmit}
        />
        {formError ? (
          <Text variant="bodySmall" tone="error">
            {formError}
          </Text>
        ) : null}
        <Button title={t('auth.sendCode')} size="lg" loading={formState.isSubmitting} onPress={onSubmit} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({ form: { gap: 16 } });
