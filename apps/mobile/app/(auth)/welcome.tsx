import { useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { brand } from '@gymova/design-tokens';
import { Button, Screen, Text } from '@/components/ui';
import { useTheme } from '@/theme';
import { setLanguage, currentLanguage } from '@/localization/i18n';

const { width } = Dimensions.get('window');
const icons: (keyof typeof Ionicons.glyphMap)[] = ['barbell-outline', 'restaurant-outline', 'sparkles-outline', 'trending-up-outline'];

export default function WelcomeScreen() {
  const { t, i18n } = useTranslation();
  const { colors, radii } = useTheme();
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);
  const slides = t('welcome.slides', { returnObjects: true }) as { title: string; body: string }[];

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const toggleLanguage = () => void setLanguage(currentLanguage() === 'en' ? 'so' : 'en');

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.topBar}>
        <Text variant="section" weight="bold">
          GYM<Text variant="section" tone="accent" weight="bold">OVA</Text>
        </Text>
        <Pressable onPress={toggleLanguage} accessibilityRole="button" accessibilityLabel={t('auth.language')} style={[styles.lang, { borderColor: colors.border, borderRadius: radii.full }]}>
          <Ionicons name="language-outline" size={16} color={colors.textSecondary} />
          <Text variant="label" tone="secondary">
            {i18n.language === 'so' ? 'SO' : 'EN'}
          </Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item, index: i }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.hero, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radii.xl }]}>
              <View style={[styles.heroIcon, { backgroundColor: colors.elevated, borderRadius: radii.full }]}>
                <Ionicons name={icons[i] ?? 'sparkles-outline'} size={56} color={colors.accent} />
              </View>
            </View>
            <Text variant="page" align="center">
              {item.title}
            </Text>
            <Text variant="body" tone="secondary" align="center">
              {item.body}
            </Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, { backgroundColor: i === index ? colors.accent : colors.border, width: i === index ? 22 : 8 }]} />
        ))}
      </View>

      <View style={styles.actions}>
        <Text variant="caption" tone="muted" align="center">
          {brand.tagline}
        </Text>
        <Button title={t('welcome.getStarted')} onPress={() => router.push('/(auth)/register')} size="lg" />
        <Button title={t('welcome.haveAccount')} variant="ghost" onPress={() => router.push('/(auth)/login')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8 },
  lang: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1 },
  slide: { paddingHorizontal: 24, gap: 14, justifyContent: 'center' },
  hero: { height: 240, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginBottom: 12 },
  heroIcon: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  dot: { height: 8, borderRadius: 4 },
  actions: { paddingHorizontal: 20, gap: 10, paddingBottom: 8 },
});
