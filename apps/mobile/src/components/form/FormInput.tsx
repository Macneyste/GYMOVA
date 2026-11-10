import { forwardRef } from 'react';
import type { TextInput } from 'react-native';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Input, type InputProps } from '@/components/ui';

interface FormInputProps<T extends FieldValues> extends Omit<InputProps, 'value' | 'onChangeText' | 'error'> {
  control: Control<T>;
  name: FieldPath<T>;
}

/**
 * react-hook-form bound Input. Zod messages are i18n keys (packages/shared-validation),
 * translated here under the `validation.` namespace.
 */
function FormInputInner<T extends FieldValues>({ control, name, ...rest }: FormInputProps<T>, ref: React.ForwardedRef<TextInput>) {
  const { t } = useTranslation();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
        <Input
          ref={ref}
          value={(value as string | undefined) ?? ''}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message ? t(`validation.${error.message}`, { defaultValue: t('validation.required') }) : undefined}
          {...rest}
        />
      )}
    />
  );
}

export const FormInput = forwardRef(FormInputInner) as <T extends FieldValues>(
  props: FormInputProps<T> & { ref?: React.ForwardedRef<TextInput> },
) => React.ReactElement;
