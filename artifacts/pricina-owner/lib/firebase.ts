import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, type Persistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ??
    'AIzaSyAS8WqifljJ2W0f7wS_if53mUgzDZIg4M',
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ??
    'pricina-a47fa.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'pricina-a47fa',
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    'pricina-a47fa.firebasestorage.app',
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '730344359595',
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ??
    '1:730344359595:web:80560ed2c8ed75c72d19ee',
  measurementId:
    process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID ?? 'G-71MYKFYM55',
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

const asyncStoragePersistence = {
  type: 'LOCAL' as const,
  _isAvailable: async () => true,
  _set: async (key: string, value: Record<string, unknown> | string) => {
    await AsyncStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  },
  _get: async <T extends Record<string, unknown> | string>(key: string) => {
    const value = await AsyncStorage.getItem(key);
    if (value === null) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  },
  _remove: async (key: string) => {
    await AsyncStorage.removeItem(key);
  },
  _addListener: () => undefined,
  _removeListener: () => undefined,
} as unknown as Persistence;

export const firebaseAuth =
  Platform.OS === 'web'
    ? getAuth(firebaseApp)
    : initializeAuth(firebaseApp, { persistence: asyncStoragePersistence });
export const firestore = getFirestore(firebaseApp);
export const firebaseProjectId = firebaseConfig.projectId;