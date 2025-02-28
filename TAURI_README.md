
# FileSync - Tauri Desktop Application

This is a cross-platform desktop application built with Tauri, React, and TypeScript.

## Prerequisites

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

## Building the Application

Since we can't modify the package.json directly, you'll need to run these commands manually:

1. **Install Tauri CLI**:
   ```
   npm install -g @tauri-apps/cli
   ```

2. **For development**:
   ```
   npx tauri dev
   ```

3. **For production build**:
   ```
   npx tauri build
   ```

## Application Structure

The application uses Tauri's native APIs for file system operations and dialogs when running as a desktop app, and falls back to web-based mocks when running in a browser.

## Features

- File synchronization between folders
- Native folder picker dialogs
- Cross-platform support (macOS, Windows, Linux)
- Configurable polling interval
- Manual sync option

## Distribution

After building, you'll find the distributable files in the `src-tauri/target/release/bundle` directory, organized by platform.
