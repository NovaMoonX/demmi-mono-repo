import { app, BrowserWindow, protocol, net, ipcMain, Notification } from 'electron';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { installExtension, REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';

const WEB_DIST_PATH = path.join(__dirname, '..', 'web-dist');

protocol.registerSchemesAsPrivileged([
	{
		scheme: 'app',
		privileges: { standard: true, secure: true, supportFetchAPI: true },
	},
]);

function createWindow(isPackaged: boolean): void {
	const mainWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		minWidth: 375,
		minHeight: 600,
		title: 'Demmi',
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: path.join(__dirname, 'preload.js'),
		},
	});

	mainWindow.loadURL('app://localhost/');

	if (!isPackaged) {
		mainWindow.webContents.openDevTools();
	}
}

const OLLAMA_BASE_URL = 'http://localhost:11434';

ipcMain.handle('check-ollama', async () => {
	try {
		const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
		const data = await res.json() as { models?: Array<{ name: string }> };
		return { running: true, models: data.models ?? [] };
	} catch {
		return { running: false, models: [] };
	}
});

ipcMain.handle('list-ollama-models', async () => {
	try {
		const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
		const data = await res.json() as { models?: Array<{ name: string }> };
		return (data.models ?? []).map((m) => m.name);
	} catch {
		return [];
	}
});

ipcMain.handle('proxy-ollama-chat', async (event, payload: {
	model: string;
	messages: Array<{ role: string; content: string }>;
	format?: unknown;
	options?: unknown;
}) => {
	const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ ...payload, stream: true }),
	});

	if (!res.body) {
		event.sender.send('ollama-done');
		return { ok: true };
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
				const chunk = JSON.parse(line) as { done?: boolean; message?: { content?: string } };
				if (!chunk.done) {
					event.sender.send('ollama-chunk', { message: { content: chunk.message?.content ?? '' } });
				}
			} catch {
				// ignore malformed JSON lines
			}
		}
	}

	event.sender.send('ollama-done');
	return { ok: true };
});

ipcMain.handle('proxy-ollama-chat-single', async (_event, payload: {
	model: string;
	messages: Array<{ role: string; content: string }>;
	format?: unknown;
	options?: unknown;
}) => {
	const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ ...payload, stream: false }),
	});
	const data = await res.json() as { message?: { content?: string } };
	return { message: { content: data.message?.content ?? '' } };
});

ipcMain.handle('proxy-ollama-generate', async (_event, payload: {
	model: string;
	prompt: string;
	format?: unknown;
}) => {
	const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ ...payload, stream: false }),
	});
	const data = await res.json() as { response?: string };
	return { response: data.response ?? '' };
});

app.whenReady().then(() => {
	protocol.handle('app', (request) => {
		const url = new URL(request.url);
		let filePath = url.pathname;

		if (filePath === '/' || !path.extname(filePath)) {
			filePath = '/index.html';
		}

		const fullPath = path.normalize(path.join(WEB_DIST_PATH, filePath));

		if (!fullPath.startsWith(WEB_DIST_PATH)) {
			return new Response('Forbidden', { status: 403 });
		}

		return net.fetch(pathToFileURL(fullPath).toString());
	});

	const isPackaged = app.isPackaged;
	console.log(`App is running in ${isPackaged ? 'production' : 'development'} mode.`);

	if (!isPackaged) {
		installExtension([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS], { loadExtensionOptions: { allowFileAccess: true } })
			.then(([redux, react]) => console.log(`Added Extensions:  ${redux.name}, ${react.name}`))
			.catch((err: Error) => console.log('An error occurred: ', err));
	}

	createWindow(isPackaged);

	// Check if Ollama is running and notify the user if it is not.
	fetch(`${OLLAMA_BASE_URL}/api/tags`)
		.then((res) => {
			if (!res.ok) throw new Error('Ollama not running');
		})
		.catch(() => {
			if (Notification.isSupported()) {
				new Notification({
					title: 'Ollama is not running',
					body: 'AI chat is disabled. Open Ollama to enable it.',
				}).show();
			}
		});

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow(isPackaged);
		}
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
