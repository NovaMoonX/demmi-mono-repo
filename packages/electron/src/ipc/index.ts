import type { IpcMain } from 'electron';
import { register as registerOllama } from './handlers/ollama';

export function registerIpcHandlers(ipcMain: IpcMain): void {
	registerOllama(ipcMain);
}
