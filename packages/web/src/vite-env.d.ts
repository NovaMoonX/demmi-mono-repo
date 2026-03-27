/// <reference types="vite/client" />

interface OllamaStatus {
  running: boolean;
  models: Array<{ name: string }>;
}

interface OllamaChatPayload {
  model: string;
  messages: Array<{ role: string; content: string }>;
  format?: unknown;
  options?: unknown;
}

interface OllamaGeneratePayload {
  model: string;
  prompt: string;
  format?: unknown;
}
interface OllamaChatChunk {
  message: { content: string };
}

interface OllamaElectronChatResponse {
  message: { content: string };
}

interface OllamaElectronGenerateResponse {
  response: string;
}

interface ElectronAPI {
  checkOllama: () => Promise<OllamaStatus>;
  listOllamaModels: () => Promise<string[]>;
  chatStream: (payload: OllamaChatPayload) => Promise<{ ok: true }>;
  chatSingle: (payload: OllamaChatPayload) => Promise<OllamaElectronChatResponse>;
  generateOllama: (payload: OllamaGeneratePayload) => Promise<OllamaElectronGenerateResponse>;
  onChunk: (cb: (chunk: OllamaChatChunk) => void) => void;
  onDone: (cb: () => void) => void;
  removeChunkListeners: () => void;
}

interface Window {
  electronAPI?: ElectronAPI;
}
