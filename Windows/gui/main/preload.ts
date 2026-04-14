import { contextBridge, ipcRenderer } from 'electron';
import type { InstallerEvent } from '../shared/ipc-contract.js';

// Hardcoded channel names — must stay in sync with shared/ipc-contract.ts.
// Cannot import shared/ here because sandbox:true preloadRequire cannot resolve
// files inside the asar archive via relative paths.
const IPC_CHANNEL_COMMAND = 'installer:invoke';
const IPC_CHANNEL_EVENT = 'installer:event';

contextBridge.exposeInMainWorld('installerApi', {
  start(payload: { mode: 'install' | 'uninstall' }): Promise<void> {
    return ipcRenderer.invoke(IPC_CHANNEL_COMMAND, { type: 'start', ...payload });
  },

  respondConfirm(id: string, confirmed: boolean): Promise<void> {
    return ipcRenderer.invoke(IPC_CHANNEL_COMMAND, { type: 'confirm-response', id, confirmed });
  },

  onEvent(handler: (event: InstallerEvent) => void): () => void {
    const listener = (_event: Electron.IpcRendererEvent, data: InstallerEvent) => handler(data);
    ipcRenderer.on(IPC_CHANNEL_EVENT, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNEL_EVENT, listener);
  },
});
