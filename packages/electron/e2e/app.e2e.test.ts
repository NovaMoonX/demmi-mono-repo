import { test, expect, _electron as electron } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MAIN_PATH = path.join(__dirname, '..', 'dist', 'main.js');

test.describe('Electron App', () => {
  test('launches and shows main window', async () => {
    const app = await electron.launch({ args: [MAIN_PATH] });
    const window = await app.firstWindow();

    const title = await window.title();
    expect(title).toBeTruthy();

    await app.close();
  });

  test('window has expected dimensions', async () => {
    const app = await electron.launch({ args: [MAIN_PATH] });
    const window = await app.firstWindow();

    const { width, height } = await window.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight,
    }));

    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);

    await app.close();
  });

  test('registers the custom app:// protocol', async () => {
    const app = await electron.launch({ args: [MAIN_PATH] });
    const window = await app.firstWindow();

    const url = window.url();
    expect(url).toMatch(/^app:\/\//);

    await app.close();
  });
});
