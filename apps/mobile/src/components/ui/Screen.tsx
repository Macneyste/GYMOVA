import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';

export interface ScreenProps {
  children: React.ReactNode;
  /** Scrollable content with keyboard avoidance (default true). */
  scroll?: boolean;
  padded?: boolean;
  /** Extra bottom padding when a tab bar is visible. */
  tabBar?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  /** Fixed footer rendered under the scroll area (e.g. primary CTA). */
  footer?: React.ReactNode;
  edges?: { top?: boolean; bottom?: boolean };
}

export function Screen({
  children,
  scroll = true,
  padded = true,
  tabBar = false,
  refreshing,
  onRefresh,
  style,
  contentStyle,
  footer,
  edges = { top: true, bottom: true },
}: ScreenProps) {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const paddingTop = edges.top ? insets.top + spacing[2] : 0;
  const paddingBottom = (edges.bottom ? insets.bottom : 0) + (tabBar ? spacing[4] : spacing[4]);
  const horizontal = padded ? spacing[5] : 0;

  const content = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} /> : undefined
      }
      contentContainerStyle={[{ paddingTop, paddingBottom: footer ? spacing[2] : paddingBottom, paddingHorizontal: horizontal, gap: spacing[4] }, contentStyle]}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1, paddingTop, paddingBottom: footer ? 0 : paddingBottom, paddingHorizontal: horizontal, gap: spacing[4] }, contentStyle]}>
      {children}
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.root, { backgroundColor: colors.background }, style]}>
      {content}
      {footer ? (
        <View style={{ paddingHorizontal: horizontal, paddingTop: spacing[3], paddingBottom: insets.bottom + spacing[3], backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border }}>
          {footer}
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
