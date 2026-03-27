import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  checkOllama: () =>
    ipcRenderer.invoke('check-ollama'),

  listOllamaModels: () =>
    ipcRenderer.invoke('list-ollama-models'),

  chatStream: (payload: {
    model: string;
    messages: unknown[];
    format?: unknown;
    options?: unknown;
  }) => ipcRenderer.invoke('proxy-ollama-chat', payload),

  chatSingle: (payload: {
    model: string;
    messages: unknown[];
    format?: unknown;
    options?: unknown;
  }) => ipcRenderer.invoke('proxy-ollama-chat-single', payload),

  generateOllama: (payload: {
    model: string;
    prompt: string;
    format?: unknown;
  }) => ipcRenderer.invoke('proxy-ollama-generate', payload),

  onChunk: (cb: (chunk: { message: { content: string } }) => void) =>
    ipcRenderer.on('ollama-chunk', (_event, chunk) => cb(chunk)),

  onDone: (cb: () => void) =>
    ipcRenderer.once('ollama-done', cb),

  removeChunkListeners: () =>
    ipcRenderer.removeAllListeners('ollama-chunk'),
});
