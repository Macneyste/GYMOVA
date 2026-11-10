import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';
import { useTheme } from '@/theme';
import { Text } from './Text';

type ToastTone = 'success' | 'error' | 'info' | 'warning';
interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}
interface ToastState {
  items: ToastItem[];
  show: (message: string, tone?: ToastTone) => void;
  dismiss: (id: number) => void;
}

let counter = 0;
export const useToastStore = create<ToastState>((set) => ({
  items: [],
  show: (message, tone = 'info') => set((s) => ({ items: [...s.items.slice(-2), { id: ++counter, message, tone }] })),
  dismiss: (id) => set((s) => ({ items: s.items.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (m: string) => useToastStore.getState().show(m, 'success'),
  error: (m: string) => useToastStore.getState().show(m, 'error'),
  info: (m: string) => useToastStore.getState().show(m, 'info'),
  warning: (m: string) => useToastStore.getState().show(m, 'warning'),
};

function ToastView({ item }: { item: ToastItem }) {
  const { colors, radii } = useTheme();
  const dismiss = useToastStore((s) => s.dismiss);
  useEffect(() => {
    const t = setTimeout(() => dismiss(item.id), 3500);
    return () => clearTimeout(t);
  }, [item.id, dismiss]);
  const icon = { success: 'checkmark-circle', error: 'alert-circle', info: 'information-circle', warning: 'warning' }[item.tone] as keyof typeof Ionicons.glyphMap;
  const color = { success: colors.success, error: colors.error, info: colors.info, warning: colors.warning }[item.tone];
  return (
    <Pressable onPress={() => dismiss(item.id)} accessibilityLiveRegion="polite" style={[styles.toast, { backgroundColor: colors.elevated, borderColor: colors.border, borderRadius: radii.md }]}>
      <Ionicons name={icon} size={20} color={color} />
      <Text variant="bodySmall" style={{ flex: 1 }}>
        {item.message}
      </Text>
    </Pressable>
  );
}

export function ToastHost() {
  const items = useToastStore((s) => s.items);
  const insets = useSafeAreaInsets();
  if (!items.length) return null;
  return (
    <View pointerEvents="box-none" style={[styles.host, { top: insets.top + 8 }]}>
      {items.map((item) => (
        <ToastView key={item.id} item={item} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  host: { position: 'absolute', left: 16, right: 16, gap: 8, zIndex: 100 },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
});
