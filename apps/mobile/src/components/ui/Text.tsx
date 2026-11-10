import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { useTheme } from '@/theme';
import { textVariants, type TextVariant } from '@/theme/typography';

export type TextTone = 'primary' | 'secondary' | 'muted' | 'accent' | 'success' | 'warning' | 'error' | 'inverse';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  tone?: TextTone;
  align?: 'left' | 'center' | 'right';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
}

export function Text({ variant = 'body', tone = 'primary', align, weight, style, ...rest }: TextProps) {
  const { colors, typography } = useTheme();
  const color = {
    primary: colors.textPrimary,
    secondary: colors.textSecondary,
    muted: colors.textMuted,
    accent: colors.accent,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    inverse: colors.background,
  }[tone];
  return (
    <RNText
      {...rest}
      style={[
        textVariants[variant],
        { color },
        align ? { textAlign: align } : null,
        weight ? { fontFamily: typography.fontFamily[weight] } : null,
        style,
      ]}
    />
  );
}
