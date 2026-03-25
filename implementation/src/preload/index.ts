import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Expose a safe, typed API to the renderer process.
// All IPC handlers will be registered here as the project grows.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
}
