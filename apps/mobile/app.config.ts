import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Expo app configuration. Public runtime values come from EXPO_PUBLIC_* variables; secrets never live here.
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'GYMOVA',
  slug: 'gymova',
  scheme: 'gymova',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#101418',
  },
  assetBundlePatterns: ['**/*'],
  android: {
    package: 'com.gymova.app',
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#101418',
    },
    permissions: ['CAMERA', 'POST_NOTIFICATIONS', 'VIBRATE', 'RECEIVE_BOOT_COMPLETED', 'SCHEDULE_EXACT_ALARM'],
    softwareKeyboardLayoutMode: 'resize',
    allowBackup: false,
  },
  web: { bundler: 'metro', output: 'static' },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-localization',
    'expo-font',
    [
      'expo-camera',
      {
        cameraPermission: 'GYMOVA uses the camera to recognise food on your plate and log it to your diary.',
        recordAudioAndroid: false,
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'GYMOVA accesses your photos so you can add progress photos and food images.',
        cameraPermission: 'GYMOVA uses the camera for progress and food photos.',
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#C5F36B',
        defaultChannel: 'reminders',
      },
    ],
    ['expo-splash-screen', { backgroundColor: '#101418', image: './assets/splash-icon.png', imageWidth: 160 }],
  ],
  experiments: { typedRoutes: true },
  extra: {
    eas: { projectId: process.env.EAS_PROJECT_ID ?? '' },
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3000/api/v1',
  },
});
