import { app, BrowserWindow, protocol, net, ipcMain, Notification } from 'electron';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { installExtension, REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import { registerIpcHandlers } from './ipc/index';
import { OLLAMA_BASE_URL } from './ipc/handlers/ollama';

const WEB_DIST_PATH = path.join(__dirname, '..', 'web-dist');

protocol.registerSchemesAsPrivileged([
	{
		scheme: 'app',
		privileges: { standard: true, secure: true, supportFetchAPI: true },
	},
]);

registerIpcHandlers(ipcMain);

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

