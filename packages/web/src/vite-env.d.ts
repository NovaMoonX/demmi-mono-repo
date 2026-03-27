/// <reference types="vite/client" />

interface OllamaHealthResult {
  ok: boolean;
  models?: Array<{ name: string }>;
  error?: string;
}

interface OllamaChatPayload {
  model: string;
  messages: Array<{ role: string; content: string }>;
  format?: unknown;
  options?: unknown;
  stream?: boolean;
}

interface OllamaGeneratePayload {
  model: string;
  prompt: string;
  format?: unknown;
  stream?: boolean;
}

interface OllamaChunkData {
  type: 'chat' | 'generate';
  content: string;
  done: boolean;
  raw: object;
}

interface OllamaDoneData {
  type: 'chat' | 'generate';
}

interface OllamaErrorData {
  type: 'chat' | 'generate';
  error: string;
}

interface OllamaElectronChatResponse {
  message: { content: string };
}

interface OllamaElectronGenerateResponse {
  response: string;
}

interface ElectronAPI {
  ollamaHealth: () => Promise<OllamaHealthResult>;
  ollamaListModels: () => Promise<string[]>;
  ollamaChat: (payload: OllamaChatPayload) => Promise<OllamaElectronChatResponse | null>;
  ollamaGenerate: (payload: OllamaGeneratePayload) => Promise<OllamaElectronGenerateResponse | null>;
  onOllamaChunk: (cb: (data: OllamaChunkData) => void) => void;
  onOllamaDone: (cb: (data: OllamaDoneData) => void) => void;
  onOllamaError: (cb: (data: OllamaErrorData) => void) => void;
  removeOllamaListeners: () => void;
}

interface Window {
  electronAPI?: ElectronAPI;
}
