
# FileSync Application

A cross-platform application for syncing files between folders, built with Tauri, React, and TypeScript.

## Features

- Browse and select folders using native file dialogs
- Configure source and destination folders for file synchronization
- Set custom polling intervals for automatic sync
- Manual sync option
- Status updates and notifications
- Cross-platform (Windows, macOS, Linux, and Android via Capacitor)

## Development Setup

### Prerequisites

Before you can build this application, you'll need:

1. **Rust** - Install from [https://rustup.rs/](https://rustup.rs/)
2. **Node.js** - Install from [https://nodejs.org/](https://nodejs.org/)
3. **Platform-specific dependencies**:

   **For macOS**:
   ```
   xcode-select --install
   ```

   **For Windows**:
   - Visual Studio C++ Build Tools
   - WebView2 component

   **For Linux**:
   ```
   sudo apt update
   sudo apt install libwebkit2gtk-4.0-dev build-essential curl wget libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
   ```

   **For Android**:
   - Android Studio
   - Android SDK
   - Java Development Kit (JDK)

### Running in Development Mode

```bash
# Install dependencies
npm install

# Start the development server (desktop)
npm run tauri dev

# For Android development
npm install @capacitor/core @capacitor/android
npx cap init
npx cap add android
npm run build
npx cap sync
npx cap open android
```

### Building the Standalone Application

```bash
# Build desktop version
npm run tauri build

# Build Android version
npm run build
npx cap sync
cd android
./gradlew assembleDebug
```

After building, you'll find the distributable files:

- **Desktop**: `src-tauri/target/release/bundle/` directory, organized by platform
- **Android**: `android/app/build/outputs/apk/debug/app-debug.apk`

## Running on Android

To run this application on an Android device:

1. Install Capacitor and Android platform
   ```bash
   npm install @capacitor/core @capacitor/android
   npx cap init FileSync com.filesync.app
   npx cap add android
   ```

2. Build the web application
   ```bash
   npm run build
   ```

3. Sync the web code to the Android project
   ```bash
   npx cap sync
   ```

4. Open the Android project in Android Studio
   ```bash
   npx cap open android
   ```

5. Connect your Android device with USB debugging enabled, or use an emulator
6. Click "Run" in Android Studio to install and launch the app on your device

## Troubleshooting

If you encounter issues with the build process:

1. Ensure all prerequisites are installed for your platform
2. Check the logs for detailed error messages
3. Make sure you have proper permissions for file system operations
4. For Android, verify USB debugging is enabled and your device is properly connected

## License

This project is licensed under the MIT License - see the LICENSE file for details.
