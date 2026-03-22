import { app, BrowserWindow, protocol, net } from 'electron';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { installExtension, REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WEB_DIST_PATH = path.join(__dirname, '..', 'web-dist');

protocol.registerSchemesAsPrivileged([
	{
		scheme: 'app',
		privileges: { standard: true, secure: true, supportFetchAPI: true },
	},
]);

function createWindow(): void {
	const mainWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		minWidth: 375,
		minHeight: 600,
		title: 'Demmi',
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
		},
	});

	mainWindow.loadURL('app://localhost/');
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

	createWindow();

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
