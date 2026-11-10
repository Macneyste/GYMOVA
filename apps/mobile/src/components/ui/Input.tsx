import { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { touchTarget } from '@gymova/design-tokens';
import { useTheme } from '@/theme';
import { Text } from './Text';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightSlot?: React.ReactNode;
  suffix?: string;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, helper, leftIcon, rightSlot, suffix, secureTextEntry, style, editable = true, ...rest },
  ref,
) {
  const { colors, radii, typography } = useTheme();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secureTextEntry);

  const borderColor = error ? colors.error : focused ? colors.accent : colors.border;

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text variant="label" tone="secondary">
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.field,
          { backgroundColor: colors.elevated, borderColor, borderRadius: radii.sm, opacity: editable ? 1 : 0.6 },
        ]}
      >
        {leftIcon ? <Ionicons name={leftIcon} size={18} color={colors.textMuted} /> : null}
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.accent}
          secureTextEntry={hidden}
          editable={editable}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          style={[styles.input, { color: colors.textPrimary, fontFamily: typography.fontFamily.regular }, style]}
          {...rest}
        />
        {suffix ? (
          <Text variant="bodySmall" tone="muted">
            {suffix}
          </Text>
        ) : null}
        {secureTextEntry ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            onPress={() => setHidden((v) => !v)}
            hitSlop={8}
          >
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}
        {rightSlot}
      </View>
      {error ? (
        <Text variant="caption" tone="error" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : helper ? (
        <Text variant="caption" tone="muted">
          {helper}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    minHeight: touchTarget + 4,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: 12 },
});
