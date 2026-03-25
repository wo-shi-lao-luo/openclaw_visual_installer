import type { EnvironmentAssessment } from '../environment/assessment'
import type { InstallResult } from '../installer/types'

/**
 * All IPC channel names used between main and renderer.
 * Centralised here to avoid string duplication.
 */
export const IPC = {
  CHECK_ENVIRONMENT: 'installer:check-environment',
  START_INSTALL: 'installer:start-install',
  INSTALL_PROGRESS: 'installer:progress'
} as const

export type IpcChannel = (typeof IPC)[keyof typeof IPC]

/** Typed response shapes for each invokeable channel */
export interface IpcResponses {
  [IPC.CHECK_ENVIRONMENT]: EnvironmentAssessment
  [IPC.START_INSTALL]: InstallResult
}
