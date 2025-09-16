import { Platform } from 'react-native';
import Constants from 'expo-constants';

function guessBaseURL(): string | undefined {
  try {
    const hostUri =
      // SDK 49+ dev config
      (Constants as any)?.expoConfig?.hostUri ??
      // Legacy manifest formats
      (Constants as any)?.manifest2?.extra?.expoClient?.hostUri ??
      (Constants as any)?.manifest?.hostUri;

    if (hostUri) {
      const host = String(hostUri).split(':')[0];
      // If we have a LAN IP, assume the API is at port 3000 on the same machine
      if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
        return `http://${host}:3000`;
      }
    }

    // Emulators fallback (native apps ignore CORS)
    if (__DEV__) {
      if (Platform.OS === 'android') return 'http://10.0.2.2:3000';
      if (Platform.OS === 'ios') return 'http://localhost:3000';
    }
  } catch {
    // no-op
  }
  return undefined;
}

/**
 * Update BASE_URL below to your computer's LAN IP if auto-detection fails.
 * Example: http://192.168.1.23:4000
 *
 * The app will also respect EXPO_PUBLIC_* env vars if you set them when running `npx expo start`:
 *   EXPO_PUBLIC_BASE_URL
 *   EXPO_PUBLIC_PROXY_BASE_URL
 *   EXPO_PUBLIC_HOST
 *   EXPO_PUBLIC_PROJECT_GROUP_ID
 */
export const BASE_URL =
  process.env.EXPO_PUBLIC_BASE_URL || 'http://192.168.100.55:3000';

export const PROXY_BASE_URL = process.env.EXPO_PUBLIC_PROXY_BASE_URL || '';

export const HOST =
  process.env.EXPO_PUBLIC_HOST ||
  (BASE_URL ? BASE_URL.replace(/^https?:\/\//, '').replace(/\/$/, '') : '');

export const PROJECT_GROUP_ID =
  process.env.EXPO_PUBLIC_PROJECT_GROUP_ID || '12345';
