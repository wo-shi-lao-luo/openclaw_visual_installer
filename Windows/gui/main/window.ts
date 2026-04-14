import { BrowserWindow } from 'electron';
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
    // __dirname = dist-gui/main/main/  →  renderer is at dist-gui/renderer/
    const rendererIndex = path.join(__dirname, '..', '..', 'renderer', 'index.html');
    win.loadFile(rendererIndex);
  }

  win.once('ready-to-show', () => {
    win.show();
  });

  return win;
}
