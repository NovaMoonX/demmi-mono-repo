import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  ollamaHealth: () =>
    ipcRenderer.invoke('ollama:health'),

  ollamaListModels: () =>
    ipcRenderer.invoke('ollama:list-models'),

  ollamaChat: (payload: {
    model: string;
    messages: unknown[];
    format?: unknown;
    options?: unknown;
    stream?: boolean;
  }) => ipcRenderer.invoke('ollama:chat', payload),

  ollamaGenerate: (payload: {
    model: string;
    prompt: string;
    format?: unknown;
    stream?: boolean;
  }) => ipcRenderer.invoke('ollama:generate', payload),

  onOllamaChunk: (cb: (data: { type: string; content: string; done: boolean; raw: object }) => void) =>
    ipcRenderer.on('ollama:chunk', (_event, data) => cb(data)),

  onOllamaDone: (cb: (data: { type: string }) => void) =>
    ipcRenderer.once('ollama:done', (_event, data) => cb(data)),

  onOllamaError: (cb: (data: { type: string; error: string }) => void) =>
    ipcRenderer.once('ollama:error', (_event, data) => cb(data)),

  removeOllamaListeners: () => {
    ipcRenderer.removeAllListeners('ollama:chunk');
    ipcRenderer.removeAllListeners('ollama:done');
    ipcRenderer.removeAllListeners('ollama:error');
  },
});
