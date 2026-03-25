import { ipcMain, WebContents } from 'electron'
import { runEnvironmentAssessment, type EnvironmentAssessment } from '../environment/assessment'
import { InstallOrchestrator } from '../installer/orchestrator'
import { createWslRunner } from '../installer/wsl-runner'
import type { InstallResult, StepRecord } from '../installer/types'
import { IPC } from './channels'

type AssessFn = () => Promise<EnvironmentAssessment>
type InstallFn = () => Promise<InstallResult>
type OnProgressFn = (step: StepRecord) => void

/**
 * Pure handler factory for environment check.
 * Accepts an inject-able assess function so it can be tested without Electron.
 */
export function createCheckEnvironmentHandler(assess: AssessFn) {
  return async (): Promise<EnvironmentAssessment> => {
    return assess()
  }
}

/**
 * Pure handler factory for install.
 * Calls onProgress for each recorded step so the renderer can show live progress.
 * If onProgress throws (e.g. window closed), the error is swallowed — the install result is always returned.
 */
export function createStartInstallHandler(install: InstallFn, onProgress: OnProgressFn) {
  return async (): Promise<InstallResult> => {
    const result = await install()
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
  const runner = createWslRunner()
  const orchestrator = new InstallOrchestrator(runner)

  ipcMain.handle(
    IPC.CHECK_ENVIRONMENT,
    createCheckEnvironmentHandler(runEnvironmentAssessment)
  )

  ipcMain.handle(
    IPC.START_INSTALL,
    createStartInstallHandler(
      () => orchestrator.install(),
      (step) => {
        const wc = webContents()
        if (wc && !wc.isDestroyed()) {
          wc.send(IPC.INSTALL_PROGRESS, step)
        }
      }
    )
  )
}
