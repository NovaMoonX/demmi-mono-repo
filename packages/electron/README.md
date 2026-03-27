# @demmi/electron

The Electron desktop application for **Demmi**. This package wraps the web app build (`@demmi/web`) in a native desktop window using [Electron](https://www.electronjs.org/).

> For project overview, target audience, and consumer-facing information, see the [root README](../../README.md).

## How It Works

The Electron app loads the static HTML/JS/CSS build output from `@demmi/web` into a `BrowserWindow`. There is no separate frontend — the exact same React app that runs in the browser runs inside the Electron shell.

**Build flow:**

1. `@demmi/web` is built via `vite build` → produces `packages/web/dist/`
2. The `dist/` output is copied to `packages/electron/web-dist/`
3. Electron's `main.ts` loads `web-dist/index.html` via the custom `app://` protocol

## Quick Start

### Prerequisites

- **Node.js** ≥ 18
- All dependencies installed from the monorepo root (`npm install`)

### From the monorepo root

```bash
npm run dev:electron
```

### From within this package

```bash
# Build the web app first
npm run build:web

# Compile TypeScript and launch Electron
npm run start
```

### Development mode

```bash
npm run dev
```

This runs `concurrently` to:
1. Build the web app
2. Watch the Electron TypeScript source for changes
3. Launch the Electron app

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Build web, watch TS, and launch Electron concurrently |
| `npm run build:web` | Build the `@demmi/web` package |
| `npm run build` | Build web + compile Electron TypeScript |
| `npm run start` | Full build then launch Electron |
| `npm run watch` | Watch Electron TypeScript for changes |
| `npm run electron:dev` | Launch Electron from compiled output |
| `npm run package` | Build and package with electron-builder |
| `npm run test` | Run Playwright E2E tests |

## Project Structure

```
packages/electron/
├── src/
│   ├── main.ts           # Electron main process entry
│   ├── preload.ts        # Context bridge — exposes window.electronAPI to renderer
│   └── ipc/              # IPC handler modules (see src/ipc/README.md)
├── dist/                  # Compiled TypeScript output (gitignored)
├── web-dist/              # Copy of @demmi/web build output (gitignored)
├── release/               # Packaged app output (gitignored)
├── package.json
├── tsconfig.json
└── README.md              # You are here
```

## IPC API

All Ollama communication is routed through the Electron main process via IPC. See [`src/ipc/README.md`](src/ipc/README.md) for the full IPC API reference, handler descriptions, streaming push events, and instructions for adding new handlers.

## Configuration

### `src/main.ts`

The main process creates a `BrowserWindow` with the following defaults:

| Setting | Value |
|---|---|
| Default size | 1200 × 800 |
| Minimum size | 375 × 600 |
| Node integration | Disabled |
| Context isolation | Enabled |
| Preload script | `dist/preload.js` |

### `electron-builder`

The `build` field in `package.json` configures packaging:

| Platform | Target |
|---|---|
| macOS | `.dmg` |
| Windows | NSIS installer |
| Linux | AppImage |

Output directory: `release/`

## Tech Stack

| Technology | Purpose |
|---|---|
| Electron | Desktop shell |
| TypeScript | Type-safe main process and preload |
| electron-builder | App packaging and distribution |
| concurrently | Parallel dev tasks |

## Notes

- The Electron app does **not** have its own UI code — it wraps `@demmi/web`
- Firebase Auth and Firestore work identically to the web version
- Ollama communication is routed through IPC — the renderer never calls `localhost:11434` directly in packaged builds
- `pullModelStream` (used to pull new models) still uses the Ollama JS client directly; this is acceptable as it is a user-triggered action and not subject to the same CSP constraints
