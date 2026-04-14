import { app, BrowserWindow, dialog } from 'electron';
import path from 'node:path';

const isDev = process.env['ELECTRON_DEV'] === '1';

export function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 700,
    height: 580,
    minWidth: 520,
    minHeight: 440,
    show: false,
    frame: true,
    titleBarStyle: 'default',
    title: 'OpenClaw Installer',
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    // extraResources copies dist-gui/renderer → resources/renderer/ (outside asar)
    // process.resourcesPath is reliable in all packaging modes
    const rendererIndex = path.join(process.resourcesPath, 'renderer', 'index.html');
    win.loadFile(rendererIndex).catch((err: unknown) => {
      dialog.showErrorBox('Failed to load UI', String(err));
    });
  }

  win.webContents.on('did-fail-load', (_e, code, desc) => {
    dialog.showErrorBox('Renderer failed to load', `${code}: ${desc}`);
  });

  win.once('ready-to-show', () => {
    win.show();
  });

  return win;
}
