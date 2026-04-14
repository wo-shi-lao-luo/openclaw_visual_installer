import { contextBridge, ipcRenderer } from 'electron';
import type { InstallerEvent } from '../shared/ipc-contract.js';
import { IPC_CHANNEL_COMMAND, IPC_CHANNEL_EVENT } from '../shared/ipc-contract.js';

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
