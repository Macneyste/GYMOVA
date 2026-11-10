import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { registerSchema, type RegisterInput } from '@gymova/shared-validation';
import { Button, Screen, Text } from '@/components/ui';
import { FormInput } from '@/components/form/FormInput';
import { AuthHeader } from '@/components/form/AuthHeader';
import { api } from '@/services/api';
import { useSession } from '@/store/session';
import { useApiErrorMessage } from '@/hooks/useApiError';
import { currentLanguage } from '@/localization/i18n';
import { useTheme } from '@/theme';

type RegisterForm = Omit<RegisterInput, 'acceptTerms'> & { acceptTerms: boolean };

export default function RegisterScreen() {
  const { t } = useTranslation();
  const { colors, radii } = useTheme();
  const router = useRouter();
  const signIn = useSession((s) => s.signIn);
  const errorMessage = useApiErrorMessage();
  const [formError, setFormError] = useState<string | null>(null);

  const { control, handleSubmit, formState, setError } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema) as never,
    defaultValues: { fullName: '', email: '', phone: '', password: '', preferredLanguage: currentLanguage(), acceptTerms: false },
  });

  const onSubmit = handleSubmit(async ({ acceptTerms: _accepted, phone, ...values }) => {
    setFormError(null);
    try {
      const session = await api.auth.register({ ...values, phone: phone || undefined });
      await signIn(session); // the auth gate sends unverified users to email verification
    } catch (err) {
      const message = errorMessage(err);
      if (message === t('auth.emailTaken')) setError('email', { message: 'email.taken' });
      else setFormError(message);
    }
  });

  return (
    <Screen>
      <AuthHeader title={t('auth.register')} subtitle={t('auth.registerSubtitle')} />
      <View style={styles.form}>
        <FormInput control={control} name="fullName" label={t('auth.fullName')} leftIcon="person-outline" autoComplete="name" textContentType="name" />
        <FormInput
          control={control}
          name="email"
          label={t('auth.email')}
          leftIcon="mail-outline"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <FormInput
          control={control}
          name="phone"
          label={`${t('auth.phone')} (${t('common.optional')})`}
          leftIcon="call-outline"
          keyboardType="phone-pad"
          autoComplete="tel"
          placeholder="+252611234567"
        />
        <FormInput
          control={control}
          name="password"
          label={t('auth.password')}
          helper={t('auth.passwordHint')}
          leftIcon="lock-closed-outline"
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
        />
        <Controller
          control={control}
          name="acceptTerms"
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <View style={styles.terms}>
              <Pressable
                onPress={() => onChange(!value)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: value }}
                style={styles.termsRow}
                hitSlop={8}
              >
                <View
                  style={[
                    styles.box,
                    { borderColor: value ? colors.accent : colors.border, backgroundColor: value ? colors.accent : 'transparent', borderRadius: radii.sm },
                  ]}
                >
                  {value ? <Ionicons name="checkmark" size={16} color={colors.background} /> : null}
                </View>
                <Text variant="bodySmall" tone="secondary" style={styles.termsText}>
                  {t('auth.acceptTerms')}
                </Text>
              </Pressable>
              {error ? (
                <Text variant="caption" tone="error">
                  {t('validation.terms.required')}
                </Text>
              ) : null}
            </View>
          )}
        />
        {formError ? (
          <Text variant="bodySmall" tone="error" accessibilityLiveRegion="polite">
            {formError}
          </Text>
        ) : null}
        <Button title={t('auth.register')} size="lg" loading={formState.isSubmitting} onPress={onSubmit} />
        <View style={styles.footer}>
          <Text variant="bodySmall" tone="secondary">
            {t('auth.hasAccount')}
          </Text>
          <Button title={t('auth.login')} variant="ghost" size="sm" onPress={() => router.replace('/(auth)/login')} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { gap: 16 },
  terms: { gap: 4 },
  termsRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  termsText: { flex: 1 },
  box: { width: 22, height: 22, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
});
