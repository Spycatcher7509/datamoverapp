
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.filesync.app',
  appName: 'FileSync',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  android: {
    // Specific configuration for Android 15
    minSdkVersion: 24,
    targetSdkVersion: 34,
    // Requesting explicit permissions needed for file access on Android
    permissions: [
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE"
    ]
  }
};

export default config;
