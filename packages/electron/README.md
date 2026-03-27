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
│   └── preload.ts        # Context bridge — exposes window.electronAPI to renderer
├── dist/                  # Compiled TypeScript output (gitignored)
├── web-dist/              # Copy of @demmi/web build output (gitignored)
├── release/               # Packaged app output (gitignored)
├── package.json
├── tsconfig.json
└── README.md              # You are here
```

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

## IPC API (`window.electronAPI`)

All Ollama communication in packaged builds is routed through the Electron main process via IPC to avoid CSP and network sandboxing issues that prevent the renderer from calling `http://localhost:11434` directly.

The preload script (`src/preload.ts`) exposes a typed `window.electronAPI` object to the renderer via `contextBridge`.

### Methods

#### `checkOllama(): Promise<{ running: boolean; models: Array<{ name: string }> }>`

Checks whether Ollama is running by calling `GET /api/tags`.

```ts
const status = await window.electronAPI.checkOllama();
if (!status.running) {
  console.log('Ollama is offline');
}
```

#### `listOllamaModels(): Promise<string[]>`

Returns the list of installed model names from `GET /api/tags`.

```ts
const models = await window.electronAPI.listOllamaModels();
// e.g. ['mistral', 'llama3']
```

#### `chatStream(payload): Promise<{ ok: true }>`

Starts a **streaming** chat completion via `POST /api/chat`. Chunks are delivered through `onChunk` events; completion is signaled by `onDone`.

```ts
window.electronAPI.onChunk((chunk) => {
  console.log(chunk.message.content);
});
window.electronAPI.onDone(() => {
  console.log('Stream complete');
  window.electronAPI.removeChunkListeners();
});
await window.electronAPI.chatStream({ model: 'mistral', messages: [...] });
```

**Payload:**

| Field | Type | Description |
|---|---|---|
| `model` | `string` | Ollama model name |
| `messages` | `Array<{ role: string; content: string }>` | Conversation messages |
| `format` | `unknown` (optional) | JSON schema for structured output |
| `options` | `unknown` (optional) | Ollama generation options |

#### `chatSingle(payload): Promise<{ message: { content: string } }>`

Performs a **non-streaming** chat completion via `POST /api/chat`.

```ts
const response = await window.electronAPI.chatSingle({
  model: 'mistral',
  messages: [{ role: 'user', content: 'Hello!' }],
});
console.log(response.message.content);
```

Same payload shape as `chatStream`.

#### `generateOllama(payload): Promise<{ response: string }>`

Performs a **non-streaming** generate call via `POST /api/generate`.

```ts
const result = await window.electronAPI.generateOllama({
  model: 'mistral',
  prompt: 'What is the capital of France?',
});
console.log(result.response);
```

| Field | Type | Description |
|---|---|---|
| `model` | `string` | Ollama model name |
| `prompt` | `string` | Prompt text |
| `format` | `unknown` (optional) | JSON schema for structured output |

#### `onChunk(cb): void`

Registers a listener for streaming chunks from `chatStream`. The callback receives `{ message: { content: string } }`.

#### `onDone(cb): void`

Registers a one-time listener for stream completion. Fires after all chunks have been sent.

#### `removeChunkListeners(): void`

Removes all `ollama-chunk` IPC listeners. Call this after `onDone` fires to clean up.

### Offline Notification

At startup, the main process calls `GET /api/tags` once. If Ollama is not running, a native OS notification is shown:

> **Ollama is not running**  
> AI chat is disabled. Open Ollama to enable it.

### Runtime Detection in the Web Layer

The web layer detects whether it is running inside Electron by checking `window.electronAPI`:

```ts
const isElectron = typeof window !== 'undefined' && !!window.electronAPI;
```

When `isElectron` is `true`, all Ollama service functions (`listLocalModels`, `ollamaChatStream`, `ollamaChatSingle`, `ollamaGenerate`) automatically route through the IPC bridge instead of calling `localhost:11434` directly. No changes are needed in components or hooks.

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
