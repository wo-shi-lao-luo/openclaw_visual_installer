import { ipcMain, WebContents } from 'electron'
import { runEnvironmentAssessment, type EnvironmentAssessment } from '../environment/assessment'
import { createNativeOrchestrator, createWslOrchestrator } from '../installer/orchestrator'
import { createNativeRunner } from '../installer/native-runner'
import { createWslRunner } from '../installer/wsl-runner'
import type { InstallMode, InstallResult, StepRecord } from '../installer/types'
import { IPC } from './channels'

type AssessFn = (mode: InstallMode) => Promise<EnvironmentAssessment>
type InstallFn = (mode: InstallMode) => Promise<InstallResult>
type OnProgressFn = (step: StepRecord) => void

function createOrchestrator(mode: InstallMode) {
  if (mode === 'native') {
    return createNativeOrchestrator(createNativeRunner())
  }

  return createWslOrchestrator(createWslRunner())
}

/**
 * Pure handler factory for environment check.
 * Accepts an inject-able assess function so it can be tested without Electron.
 */
export function createCheckEnvironmentHandler(assess: AssessFn) {
  return async (mode: InstallMode = 'wsl'): Promise<EnvironmentAssessment> => {
    return assess(mode)
  }
}

/**
 * Pure handler factory for install.
 * Calls onProgress for each recorded step so the renderer can show live progress.
 * If onProgress throws (e.g. window closed), the error is swallowed — the install result is always returned.
 */
export function createStartInstallHandler(install: InstallFn, onProgress: OnProgressFn) {
  return async (mode: InstallMode = 'wsl'): Promise<InstallResult> => {
    const result = await install(mode)
    for (const step of result.steps) {
      try {
        onProgress(step)
      } catch {
        // renderer may have closed; do not let this abort the result
      }
    }
    return result
  }
}

/**
 * Registers all IPC handlers on the main process.
 * Call once after the app is ready.
 */
export function registerIpcHandlers(webContents: () => WebContents | null): void {
  ipcMain.handle(
    IPC.CHECK_ENVIRONMENT,
    createCheckEnvironmentHandler((mode) => runEnvironmentAssessment(mode))
  )

  ipcMain.handle(
    IPC.START_INSTALL,
    createStartInstallHandler(
      async (mode) => createOrchestrator(mode).install(),
      (step) => {
        const wc = webContents()
        if (wc && !wc.isDestroyed()) {
          wc.send(IPC.INSTALL_PROGRESS, step)
        }
      }
    )
  )
}
