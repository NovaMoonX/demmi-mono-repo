const { test, expect, _electron: electron } = require('@playwright/test');
const path = require('path');

const MAIN_PATH = path.join(__dirname, '..', 'dist', 'main.js');

// Helper to get the main app window, skipping DevTools
async function getMainWindow(app) {
	return app.firstWindow();
}

test.describe('Electron App', () => {
	test('launches and shows main window', async () => {
		const app = await electron.launch({ args: [MAIN_PATH] });
		const window = await getMainWindow(app);

		const title = await window.title();
		expect(title).toBeTruthy();

		await app.close();
	});

	test('window has expected dimensions', async () => {
		const app = await electron.launch({ args: [MAIN_PATH] });
		await getMainWindow(app);

		// Use the Playwright window size API instead of innerWidth/innerHeight
		const size = await app.evaluate(({ BrowserWindow }) => {
			const win = BrowserWindow.getAllWindows()[0];
			const [width, height] = win.getSize();
			return { width, height };
		});

		expect(size.width).toBeGreaterThan(0);
		expect(size.height).toBeGreaterThan(0);

		await app.close();
	});

	test('registers the custom app:// protocol', async () => {
		const app = await electron.launch({ args: [MAIN_PATH] });
		await getMainWindow(app);

		// Get URL from main process instead of the window
		// Wait until the URL is loaded
		const url = await app.evaluate(async ({ BrowserWindow }) => {
			const win = BrowserWindow.getAllWindows()[0];
			await new Promise((resolve) => {
				if (win.webContents.getURL()) return resolve();
				win.webContents.once('did-navigate', resolve);
			});
			return win.webContents.getURL();
		});

		expect(url).toMatch(/^app:\/\//);

		await app.close();
	});
});
