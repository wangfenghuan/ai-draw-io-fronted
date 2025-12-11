# Electron Desktop App Build Guide

This guide explains how to package W-Next AI Drawio as a desktop application using Electron.

## Prerequisites

Ensure you have the following installed:

- Node.js (v20 or higher) - [Download here](https://nodejs.org/)
- npm (comes with Node.js)
- macOS (for building macOS apps)

## Installation

First, install the new dependencies:

```bash
npm install
```

This will install:
- `electron` - v35.2.1
- `electron-builder` - v26.0.12
- `concurrently` - v9.1.2
- `wait-on` - v8.0.3

## Development Mode

To run the app in development mode:

```bash
npm run electron:dev
```

This command will:
1. Start the Next.js development server on port 6002
2. Launch Electron when the server is ready
3. Enable hot-reload for both Next.js and Electron

## Building for Production

### Step 1: Build Next.js Application

```bash
npm run build
```

This creates the production build in the `out/` directory.

### Step 2: Build Electron App

#### Option A: Build for macOS (Universal - Intel + Apple Silicon)

```bash
npm run electron:build:mac:universal
```

Output: `dist/W-Next AI Drawio-x.x.x-universal.dmg`

#### Option B: Build for macOS (Separate Architectures)

```bash
npm run electron:build:mac
```

Output:
- `dist/W-Next AI Drawio-x.x.x-arm64.dmg` (Apple Silicon M1/M2/M3)
- `dist/W-Next AI Drawio-x.x.x-x64.dmg` (Intel)

#### Option C: Build for All Platforms

```bash
npm run electron:build
```

This will build for macOS, Windows, and Linux.

## Build Outputs

All build artifacts are located in the `dist/` directory:

```
dist/
├── W-Next AI Drawio-0.3.0-universal.dmg   # macOS universal installer
├── W-Next AI Drawio-0.3.0-universal.zip   # macOS universal zip
├── win-unpacked/                         # Windows unpacked (for testing)
├── mac/                                  # macOS unpacked app
└── linux-unpacked/                       # Linux unpacked
```

## Build Configuration

The build configuration is defined in `electron-builder.yml`:

### macOS-Specific Settings

- **Category**: `public.app-category.productivity`
- **Icon**: `build/icon.icns` (you need to provide this)
- **Hardended Runtime**: Enabled for security
- **Gatekeeper**: Disabled for easier distribution
- **Signatures**: Code signing disabled (you'll need to configure for distribution)

### Adding Icons

Before building, add application icons:

1. **macOS Icon**: Place `icon.icns` in `build/` directory
   - Recommended size: 1024x1024px
   - Can convert PNG to ICNS using online tools or:
     ```bash
     npm install -g iconutil-cli
     iconutil-cli --input icon.png --output build/icon.icns
     ```

2. **Windows Icon**: Place `icon.ico` in `build/` directory
   - Recommended size: 256x256px
   - Use online converters or ImageMagick

3. **Linux Icon**: Place `icon.png` in `build/` directory
   - Recommended size: 512x512px

## Code Signing (macOS)

For distribution outside the App Store, you need to code sign the application:

1. Enroll in [Apple Developer Program](https://developer.apple.com/)
2. Generate certificates in Xcode
3. Configure environment variables:

```bash
export APPLE_ID="your-apple-id@example.com"
export APPLE_APP_SPECIFIC_PASSWORD="your-app-specific-password"
export CSC_LINK="path/to/certificate.p12"
export CSC_KEY_PASSWORD="certificate-password"
```

Then build:

```bash
npm run electron:build:mac
```

## Troubleshooting

### Build Fails: "icon.icns not found"

Create a simple icon or download a template:

```bash
# Create build directory if not exists
mkdir -p build

# Download a placeholder icon (optional)
curl -o build/icon.png https://via.placeholder.com/1024x1024.png

# Convert to ICNS (requires iconutil)
sips -s format icns build/icon.png --out build/icon.icns
```

### Build Fails: "Cannot find module 'electron'"

Ensure dependencies are installed:

```bash
rm -rf node_modules package-lock.json
npm install
```

### App Doesn't Launch (White Screen)

1. Check if Next.js build exists:
   ```bash
   ls -la out/index.html
   ```

2. Check Electron logs:
   ```bash
   npm run electron:build:dir
   ./dist/mac/W-Next\ AI\ Drawio.app/Contents/MacOS/W-Next\ AI\ Drawio
   ```

3. Enable dev tools in production build:
   - Uncomment `mainWindow.webContents.openDevTools()` in `electron/main.ts`
   - Rebuild

### Binary Size Too Large

Electron apps are large by nature (~150MB). To reduce:

1. Use `electron-builder` with compression
2. Remove unnecessary dependencies
3. Use `--dir` flag for portable version

## Distribution

### For Personal Use

Simply use the DMG file:

```bash
npm run electron:build:mac:universal
open dist/W-Next\ AI\ Drawio-*.dmg
```

### For Distribution

1. Code sign the app (see Code Signing section)
2. Notarize with Apple
3. Create an installer DMG

```bash
# Build signed app
CSC_NAME="Developer ID Application: Your Name" npm run electron:build:mac:universal

# Upload for notarization (automatic with electron-builder)
```

## Development Tips

### Reloading the App in Development

Press `Cmd+R` or `Ctrl+R` to reload the Electron window.

### Opening Developer Tools

In development mode, developer tools are automatically opened.
In production, add to `electron/main.ts`:

```javascript
if (isDev) {
    mainWindow.webContents.openDevTools()
}
```

### Debugging the Main Process

```bash
# Run with debugging
ELECTRON_ENABLE_LOGGING=true npm run electron:dev
```

## Next Steps

1. @TODO: Add auto-updater support
2. @TODO: Add native menu bar
3. @TODO: Add file system access for local saves
4. @TODO: Implement offline mode

## Additional Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [electron-builder Documentation](https://www.electron.build/)
- [Next.js + Electron Guide](https://github.com/saltyshiomix/nextron)

## Support

If you encounter issues building the Electron app, please open an issue at:
https://github.com/wangfenghuan/w-next-ai-drawio/issues
