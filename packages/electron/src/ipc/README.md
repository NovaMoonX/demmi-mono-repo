# IPC Layer

All Electron IPC handlers for the main process live here. The entry point
`ipc/index.ts` is the only file imported by `main.ts`; everything else is
internal to this directory.

## Directory structure

```
ipc/
├── index.ts               # Registers all handler modules with ipcMain
├── handlers/
│   └── ollama.ts          # Ollama AI handlers (health, models, chat, generate)
└── README.md              # This file
```

## Adding a new group of IPC handlers

1. Create `ipc/handlers/<feature>.ts` and export a `register(ipcMain)` function
   that calls `ipcMain.handle(...)` for each channel.
2. Add the new module to `ipc/index.ts` by importing it and calling its
   `register` function inside `registerIpcHandlers`.
3. Expose the new channel(s) in `preload.ts` under `window.electronAPI`.
4. Add the TypeScript type declarations for the new methods to
   `packages/web/src/vite-env.d.ts` in the `ElectronAPI` interface.
5. Update this README — add a row to the Handlers table.

## Handlers

| IPC channel | File | Description | Returns |
|---|---|---|---|
| `ollama:health` | `handlers/ollama.ts` | Pings Ollama at `localhost:11434` | `{ ok: boolean, models?: Array<{ name: string }>, error?: string }` |
| `ollama:list-models` | `handlers/ollama.ts` | Returns all locally installed model names | `string[]` |
| `ollama:chat` | `handlers/ollama.ts` | Chat completion. `stream: false` (default) → returns `{ message: { content } }`. `stream: true` → pushes `ollama:chunk` / `ollama:done` / `ollama:error` events and resolves with `null` | `{ message: { content: string } } \| null` |
| `ollama:generate` | `handlers/ollama.ts` | Text generation. `stream: false` (default) → returns `{ response }`. `stream: true` → pushes `ollama:chunk` / `ollama:done` / `ollama:error` events and resolves with `null` | `{ response: string } \| null` |

### Streaming push events (sent by `ollama:chat` / `ollama:generate` when `stream: true`)

| Event channel | Payload | Description |
|---|---|---|
| `ollama:chunk` | `{ type: 'chat'\|'generate', content: string, done: boolean, raw: object }` | One streamed token chunk |
| `ollama:done` | `{ type: 'chat'\|'generate' }` | Stream completed successfully |
| `ollama:error` | `{ type: 'chat'\|'generate', error: string }` | Stream failed |

## `window.electronAPI` bridge (preload)

The `preload.ts` file exposes the following methods on `window.electronAPI`.
TypeScript types are declared in `packages/web/src/vite-env.d.ts`.

| Method | IPC channel | Description |
|---|---|---|
| `ollamaHealth()` | `ollama:health` | Check whether Ollama is running |
| `ollamaListModels()` | `ollama:list-models` | List installed model names |
| `ollamaChat(payload)` | `ollama:chat` | Chat request — streaming or non-streaming |
| `ollamaGenerate(payload)` | `ollama:generate` | Generate request — streaming or non-streaming |
| `onOllamaChunk(cb)` | `ollama:chunk` | Register chunk listener for streaming |
| `onOllamaDone(cb)` | `ollama:done` | Register one-time done listener |
| `onOllamaError(cb)` | `ollama:error` | Register one-time error listener |
| `removeOllamaListeners()` | — | Remove all `ollama:*` push-event listeners |
