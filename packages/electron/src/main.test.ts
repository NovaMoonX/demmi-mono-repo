jest.mock('electron', () => ({
  app: {
    whenReady: jest.fn().mockReturnValue(Promise.resolve()),
    on: jest.fn(),
    isPackaged: false,
    quit: jest.fn(),
  },
  BrowserWindow: jest.fn().mockImplementation(() => ({
    loadURL: jest.fn(),
  })),
  protocol: {
    registerSchemesAsPrivileged: jest.fn(),
    handle: jest.fn(),
  },
  net: {
    fetch: jest.fn(),
  },
}));

jest.mock('electron-devtools-installer', () => ({
  installExtension: jest.fn().mockResolvedValue([
    { name: 'Redux DevTools' },
    { name: 'React Developer Tools' },
  ]),
  REDUX_DEVTOOLS: 'redux-devtools',
  REACT_DEVELOPER_TOOLS: 'react-developer-tools',
}));

describe('Electron app configuration', () => {
  it('has electron as a dependency', () => {
    const pkg = require('../package.json');
    expect(pkg.devDependencies['electron']).toBeDefined();
  });

  it('defines the main entry point', () => {
    const pkg = require('../package.json');
    expect(pkg.main).toBe('dist/main.js');
  });

  it('configures electron-builder with correct app details', () => {
    const pkg = require('../package.json');
    expect(pkg.build.appId).toBe('com.demmi.app');
    expect(pkg.build.productName).toBe('Demmi');
    expect(pkg.build.files).toContain('web-dist/**/*');
  });

  it('includes required build targets', () => {
    const pkg = require('../package.json');
    expect(pkg.build.mac).toBeDefined();
    expect(pkg.build.win).toBeDefined();
    expect(pkg.build.linux).toBeDefined();
  });

  it('mocked Electron modules have the expected API shape', () => {
    const { app, BrowserWindow, protocol, net } = require('electron');

    expect(app.whenReady).toBeDefined();
    expect(app.on).toBeDefined();
    expect(BrowserWindow).toBeDefined();
    expect(protocol.registerSchemesAsPrivileged).toBeDefined();
    expect(protocol.handle).toBeDefined();
    expect(net.fetch).toBeDefined();
  });
});
