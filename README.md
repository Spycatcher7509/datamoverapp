
# FileSync Application

A desktop application for syncing files between folders, built with Tauri, React, and TypeScript.

## Features

- Browse and select folders using native file dialogs
- Configure source and destination folders for file synchronization
- Set custom polling intervals for automatic sync
- Manual sync option
- Status updates and notifications
- Cross-platform (Windows, macOS, Linux)

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

### Running in Development Mode

```bash
# Install dependencies
npm install

# Start the development server
npm run tauri dev
```

### Building the Standalone Application

```bash
# Build the production version
npm run tauri build
```

After building, you'll find the distributable files in the `src-tauri/target/release/bundle` directory, organized by platform:

- **Windows**: `src-tauri/target/release/bundle/msi/` - Contains the MSI installer
- **macOS**: `src-tauri/target/release/bundle/dmg/` - Contains the DMG installer
- **Linux**: `src-tauri/target/release/bundle/appimage/` and `src-tauri/target/release/bundle/deb/` - Contains AppImage and DEB packages

## Troubleshooting

If you encounter issues with the build process:

1. Ensure all prerequisites are installed for your platform
2. Check the Tauri logs for detailed error messages
3. Make sure you have proper permissions for file system operations

## License

This project is licensed under the MIT License - see the LICENSE file for details.
