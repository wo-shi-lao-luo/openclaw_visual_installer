import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '../main/ipc/channels'
import type { EnvironmentAssessment } from '../main/environment/assessment'
import type { InstallMode, InstallResult, StepRecord } from '../main/installer/types'

/**
 * Typed API exposed to the renderer via contextBridge.
 * The renderer never accesses ipcRenderer directly.
 */
const installerApi = {
  checkEnvironment: (mode: InstallMode = 'wsl'): Promise<EnvironmentAssessment> =>
    ipcRenderer.invoke(IPC.CHECK_ENVIRONMENT, mode),

  startInstall: (mode: InstallMode = 'wsl'): Promise<InstallResult> =>
    ipcRenderer.invoke(IPC.START_INSTALL, mode),

  onInstallProgress: (callback: (step: StepRecord) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, step: StepRecord): void =>
      callback(step)
    ipcRenderer.on(IPC.INSTALL_PROGRESS, listener)
    // Returns an unsubscribe function for cleanup in React effects
    return () => ipcRenderer.removeListener(IPC.INSTALL_PROGRESS, listener)
  }
}

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('installer', installerApi)
} else {
  // @ts-ignore
  window.installer = installerApi
}

export type InstallerApi = typeof installerApi
