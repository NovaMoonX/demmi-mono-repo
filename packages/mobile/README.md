# @demmi/mobile

The Expo (React Native) mobile application for **Demmi**. This package wraps the deployed web app in a native mobile shell using [Expo](https://expo.dev) and [react-native-webview](https://github.com/nickolcorp/react-native-webview).

> For project overview, target audience, and consumer-facing information, see the [root README](../../README.md).

## How It Works

The mobile app uses a `WebView` component to load the hosted Demmi web application (`https://demmi.moondreams.dev/`). The entire UI is the same React web app — rendered inside a native mobile container with safe area handling and platform-appropriate status bar styling.

**Architecture:**

1. Expo Router provides the app shell (`app/_layout.tsx`)
2. The main screen (`app/index.tsx`) renders a full-screen `WebView`
3. The WebView loads the deployed Demmi web app URL
4. A custom user agent identifies requests as coming from the mobile app

## Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **Expo CLI**: included via the `expo` dependency
- **Expo Go** app on your phone (for development): [iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
- All dependencies installed from the monorepo root (`npm install`)

### From the monorepo root

```bash
npm run dev:mobile
```

### From within this package

```bash
cd packages/mobile
npx expo start
```

Scan the QR code in your terminal with the **Expo Go** app to open Demmi on your device.

### Platform-specific

```bash
# iOS Simulator
npx expo start --ios

# Android Emulator
npx expo start --android
```

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Expo development server |
| `npm run android` | Start Expo for Android |
| `npm run ios` | Start Expo for iOS |
| `npm run build:web` | Build the `@demmi/web` package |
| `npm run prebuild` | Generate native iOS/Android projects |
| `npm run test` | Run Jest tests |

## Project Structure

```
packages/mobile/
├── app/
│   ├── _layout.tsx       # Root layout (Expo Router)
│   └── index.tsx         # Main screen with WebView
├── assets/               # App icons and splash images
├── src/                  # Additional native source (if needed)
├── app.json              # Expo configuration
├── babel.config.js       # Babel configuration
├── package.json
├── tsconfig.json
└── README.md             # You are here
```

## Configuration

### `app.json`

| Setting | Value |
|---|---|
| App name | Demmi |
| Slug | demmi |
| Scheme | `demmi://` |
| Bundle ID (iOS) | `com.demmi.mobile` |
| Package (Android) | `com.demmi.mobile` |
| Orientation | Portrait |
| User interface style | Automatic (follows system theme) |

### WebView URL

The WebView points to the deployed web app:

```typescript
const WEB_APP_URL = 'https://demmi.moondreams.dev/';
```

To use a local dev server instead during development, update the URL in `app/index.tsx`:

```typescript
const WEB_APP_URL = 'http://<your-local-ip>:5173';
```

> **Tip:** Run `npm run dev:web` at the monorepo root and use the network URL from the Vite output.

## Tech Stack

| Technology | Purpose |
|---|---|
| Expo ~53 | React Native framework and tooling |
| Expo Router | File-based routing |
| React Native | Mobile runtime |
| react-native-webview | WebView component for loading the web app |
| TypeScript | Type-safe development |

## Notes

- The mobile app does **not** have its own UI code — it wraps the deployed `@demmi/web`
- Firebase Auth works via the web app inside the WebView — no native Firebase SDK needed
- Ollama (localhost) is **not** accessible from a mobile WebView because `localhost` inside the WebView refers to the device itself, not the user's desktop. As a result:
  - The **Chat** tab is hidden from the navigation sidebar on mobile
  - The **Chat screen** shows an informative message explaining that Ollama must be installed on a desktop, with a link to [https://ollama.com/download](https://ollama.com/download)
  - This is detected at runtime via `window.ReactNativeWebView` (injected by the WebView) or the `ExpoWebView` user agent suffix
- For production builds, use `expo prebuild` to generate native projects, then build with Xcode (iOS) or Android Studio (Android)
