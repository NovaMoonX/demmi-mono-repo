/** @type {import('jest').Config} */
const config = {
  preset: 'jest-expo',
  roots: ['<rootDir>/app'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|react-native-svg|react-native-webview|react-native-safe-area-context|react-native-screens|expo-status-bar|expo-constants|expo-router|expo-linking|expo-splash-screen)',
  ],
};

module.exports = config;
