import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Language } from '@gymova/shared-types';
import en from './en.json';
import so from './so.json';

export const LANGUAGE_KEY = 'gymova.language';
export const resources = { en: { translation: en }, so: { translation: so } } as const;

function detectLanguage(): Language {
  const code = getLocales()[0]?.languageCode?.toLowerCase();
  return code === 'so' ? 'so' : 'en';
}

export async function initI18n(): Promise<void> {
  if (i18n.isInitialized) return;
  let stored: string | null = null;
  try {
    stored = await AsyncStorage.getItem(LANGUAGE_KEY);
  } catch {
    stored = null;
  }
  const lng = stored === 'so' || stored === 'en' ? stored : detectLanguage();
  await i18n.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    returnNull: false,
  });
}

export async function setLanguage(lng: Language): Promise<void> {
  await i18n.changeLanguage(lng);
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, lng);
  } catch {
    // non-critical
  }
}

export function currentLanguage(): Language {
  return i18n.language === 'so' ? 'so' : 'en';
}

export default i18n;
