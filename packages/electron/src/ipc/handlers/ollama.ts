import type { IpcMain, IpcMainInvokeEvent } from 'electron';

export const OLLAMA_BASE_URL = 'http://localhost:11434';

interface OllamaChatPayload {
	model: string;
	messages: Array<{ role: string; content: string }>;
	format?: string | object;
	options?: Record<string, unknown>;
	stream?: boolean;
}

interface OllamaGeneratePayload {
	model: string;
	prompt: string;
	format?: string | object;
	stream?: boolean;
}

async function handleOllamaHealth() {
	try {
		const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
		const data = await res.json() as { models?: Array<{ name: string }> };
		return { ok: true, models: data.models ?? [] };
	} catch (err) {
		return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' };
	}
}

async function handleOllamaListModels() {
	try {
		const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
		const data = await res.json() as { models?: Array<{ name: string }> };
		return (data.models ?? []).map((m) => m.name);
	} catch {
		return [];
	}
}

async function handleOllamaChat(
	event: IpcMainInvokeEvent,
	payload: OllamaChatPayload,
) {
	const stream = payload.stream ?? false;
	const { stream: _stream, ...rest } = payload;

	if (!stream) {
		try {
			const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...rest, stream: false }),
			});
			if (!res.ok) {
				throw new Error(`Ollama responded with ${res.status}: ${res.statusText}`);
			}
			const data = await res.json() as { message?: { content?: string } };
			return { message: { content: data.message?.content ?? '' } };
		} catch (err) {
			throw new Error(err instanceof Error ? err.message : 'Ollama chat request failed');
		}
	}

	try {
		const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ ...rest, stream: true }),
		});

		if (!res.body) {
			event.sender.send('ollama:done', { type: 'chat' });
			return null;
		}

		const reader = res.body.getReader();
		const decoder = new TextDecoder();
		let buffer = '';

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			buffer += decoder.decode(value, { stream: true });
			const lines = buffer.split('\n');
			buffer = lines.pop() ?? '';
			for (const line of lines) {
				if (!line.trim()) continue;
				try {
					const raw = JSON.parse(line) as { done?: boolean; message?: { content?: string } };
					// Skip the final done-only line — ollama:done will signal completion
					if (raw.done) continue;
					const content = raw.message?.content ?? '';
					event.sender.send('ollama:chunk', { type: 'chat', content, done: false, raw });
				} catch {
					// ignore malformed JSON lines
				}
			}
		}

		event.sender.send('ollama:done', { type: 'chat' });
	} catch (err) {
		event.sender.send('ollama:error', {
			type: 'chat',
			error: err instanceof Error ? err.message : 'Stream failed',
		});
	}

	return null;
}

async function handleOllamaGenerate(
	event: IpcMainInvokeEvent,
	payload: OllamaGeneratePayload,
) {
	const stream = payload.stream ?? false;
	const { stream: _stream, ...rest } = payload;

	if (!stream) {
		try {
			const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...rest, stream: false }),
			});
			if (!res.ok) {
				throw new Error(`Ollama responded with ${res.status}: ${res.statusText}`);
			}
			const data = await res.json() as { response?: string };
			return { response: data.response ?? '' };
		} catch (err) {
			throw new Error(err instanceof Error ? err.message : 'Ollama generate request failed');
		}
	}

	try {
		const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ ...rest, stream: true }),
		});

		if (!res.body) {
			event.sender.send('ollama:done', { type: 'generate' });
			return null;
		}

		const reader = res.body.getReader();
		const decoder = new TextDecoder();
		let buffer = '';

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			buffer += decoder.decode(value, { stream: true });
			const lines = buffer.split('\n');
			buffer = lines.pop() ?? '';
			for (const line of lines) {
				if (!line.trim()) continue;
				try {
					const raw = JSON.parse(line) as { done?: boolean; response?: string };
					// Skip the final done-only line — ollama:done will signal completion
					if (raw.done) continue;
					const content = raw.response ?? '';
					event.sender.send('ollama:chunk', { type: 'generate', content, done: false, raw });
				} catch {
					// ignore malformed JSON lines
				}
			}
		}

		event.sender.send('ollama:done', { type: 'generate' });
	} catch (err) {
		event.sender.send('ollama:error', {
			type: 'generate',
			error: err instanceof Error ? err.message : 'Stream failed',
		});
	}

	return null;
}

export function register(ipcMain: IpcMain): void {
	ipcMain.handle('ollama:health', handleOllamaHealth);
	ipcMain.handle('ollama:list-models', handleOllamaListModels);
	ipcMain.handle('ollama:chat', (event, payload: OllamaChatPayload) =>
		handleOllamaChat(event, payload),
	);
	ipcMain.handle('ollama:generate', (event, payload: OllamaGeneratePayload) =>
		handleOllamaGenerate(event, payload),
	);
}
