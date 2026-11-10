import { useRef, useState } from 'react';
import { StyleSheet, View, type TextInput } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { loginSchema, type LoginInput } from '@gymova/shared-validation';
import { Button, Screen, Text } from '@/components/ui';
import { FormInput } from '@/components/form/FormInput';
import { AuthHeader } from '@/components/form/AuthHeader';
import { api } from '@/services/api';
import { useSession } from '@/store/session';
import { useApiErrorMessage } from '@/hooks/useApiError';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const signIn = useSession((s) => s.signIn);
  const expired = useSession((s) => s.expired);
  const errorMessage = useApiErrorMessage();
  const [formError, setFormError] = useState<string | null>(null);
  const passwordRef = useRef<TextInput>(null);

  const { control, handleSubmit, formState } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const session = await api.auth.login(values);
      await signIn(session); // the auth gate routes to the app
    } catch (err) {
      setFormError(errorMessage(err));
    }
  });

  return (
    <Screen>
      <AuthHeader title={t('auth.welcomeBack')} subtitle={expired ? t('auth.sessionExpiredBody') : t('auth.loginSubtitle')} />
      <View style={styles.form}>
        <FormInput
          control={control}
          name="email"
          label={t('auth.email')}
          leftIcon="mail-outline"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <FormInput
          ref={passwordRef}
          control={control}
          name="password"
          label={t('auth.password')}
          leftIcon="lock-closed-outline"
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={onSubmit}
        />
        <Link href="/(auth)/forgot-password" style={styles.forgot}>
          <Text variant="label" tone="accent">
            {t('auth.forgotPassword')}
          </Text>
        </Link>
        {formError ? (
          <Text variant="bodySmall" tone="error" accessibilityLiveRegion="polite">
            {formError}
          </Text>
        ) : null}
        <Button title={t('auth.login')} size="lg" loading={formState.isSubmitting} onPress={onSubmit} />
        <View style={styles.footer}>
          <Text variant="bodySmall" tone="secondary">
            {t('auth.noAccount')}
          </Text>
          <Button title={t('auth.register')} variant="ghost" size="sm" onPress={() => router.replace('/(auth)/register')} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { gap: 16 },
  forgot: { alignSelf: 'flex-end' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
});
