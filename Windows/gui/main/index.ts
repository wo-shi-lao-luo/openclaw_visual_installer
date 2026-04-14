import { app, dialog } from 'electron';
import os from 'node:os';
import { createWindow } from './window.js';
import { registerInstallerIpc } from './ipc/registerInstallerIpc.js';
import { checkWindowsMinimumBuild } from './osCheck.js';

// Electron Security Best Practice: disable navigation to external URLs
app.on('web-contents-created', (_event, contents) => {
  contents.on('will-navigate', (event) => {
    event.preventDefault();
  });
  contents.setWindowOpenHandler(() => ({ action: 'deny' }));
});

let cleanup: (() => void) | null = null;

app.whenReady().then(() => {
  // Enforce Windows 10 1809 minimum at runtime (second safety net after NSIS check)
  if (process.platform === 'win32') {
    const check = checkWindowsMinimumBuild(os.release());
    if (!check.supported) {
      dialog.showErrorBox(
        'Unsupported Windows version',
        check.reason ?? 'Your Windows version is not supported. Please update to Windows 10 1809 or later.',
      );
      app.quit();
      return;
    }
  }

  let mainWindow = createWindow();

  cleanup = registerInstallerIpc(() => mainWindow);

  app.on('activate', () => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      mainWindow = createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  cleanup?.();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
