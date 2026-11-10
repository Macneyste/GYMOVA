import { Pressable, StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme';

export interface CardProps extends ViewProps {
  elevated?: boolean;
  padding?: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accent?: boolean;
}

export function Card({ elevated = false, padding = 16, onPress, style, children, accent = false, ...rest }: CardProps) {
  const { colors, radii } = useTheme();
  const base = [
    styles.card,
    {
      backgroundColor: elevated ? colors.elevated : colors.card,
      borderColor: accent ? colors.accent : colors.border,
      borderRadius: radii.lg,
      padding,
    },
    style,
  ];
  if (onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [base, { opacity: pressed ? 0.9 : 1 }]} {...rest}>
        {children}
      </Pressable>
    );
  }
  return (
    <View style={base} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, gap: 10 },
});
