import { detectWindowsVersion, type WindowsVersionResult } from './windows-version'
import { detectWslStatus, type WslStatusResult } from './wsl-status'
import type { InstallMode } from '../installer/types'

export type EnvironmentStatus = 'ready' | 'not_supported' | 'needs_setup' | 'error'

export type BlockerCode =
  | 'WINDOWS_VERSION_TOO_OLD'
  | 'WINDOWS_VERSION_UNKNOWN'
  | 'WSL_NOT_INSTALLED'
  | 'UBUNTU_NOT_INSTALLED'
  | 'UBUNTU_NOT_WSL2'

export interface EnvironmentBlocker {
  code: BlockerCode
  message: string
  canAutoResolve: boolean
  userAction?: string
}

export interface EnvironmentAssessment {
  status: EnvironmentStatus
  windowsVersion: WindowsVersionResult
  wslStatus: WslStatusResult
  blockers: EnvironmentBlocker[]
}

/**
 * Combines a WindowsVersionResult and a WslStatusResult into a single EnvironmentAssessment.
 * Pure function — no side effects, fully testable.
 *
 * In native mode, WSL blockers are skipped. Readiness is determined by Windows version alone
 * (npm availability is verified at install time, not here).
 */
export function buildAssessment(
  windowsVersion: WindowsVersionResult,
  wslStatus: WslStatusResult,
  mode: InstallMode = 'wsl'
): EnvironmentAssessment {
  const blockers: EnvironmentBlocker[] = []

  // Windows version checks (apply to both modes)
  if (!windowsVersion.supported) {
    if (windowsVersion.buildNumber === null) {
      blockers.push({
        code: 'WINDOWS_VERSION_UNKNOWN',
        message: windowsVersion.reason ?? 'Windows version could not be determined.',
        canAutoResolve: false,
        userAction: 'Verify your Windows version manually in Settings > System > About.'
      })
    } else {
      blockers.push({
        code: 'WINDOWS_VERSION_TOO_OLD',
        message: windowsVersion.reason ?? `Windows Build ${windowsVersion.buildNumber} is not supported.`,
        canAutoResolve: false,
        userAction: 'Upgrade to Windows 10 version 2004 (Build 19041) or later.'
      })
    }
  }

  // WSL checks (WSL mode only — native mode uses npm and does not require WSL)
  if (mode === 'wsl') {
    if (!wslStatus.wslAvailable) {
      blockers.push({
        code: 'WSL_NOT_INSTALLED',
        message: wslStatus.reason ?? 'WSL is not installed.',
        canAutoResolve: true,
        userAction: 'The installer can enable WSL automatically, or you can run "wsl --install" yourself.'
      })
    } else if (!wslStatus.ubuntuDistro) {
      blockers.push({
        code: 'UBUNTU_NOT_INSTALLED',
        message: wslStatus.reason ?? 'No Ubuntu distribution found in WSL.',
        canAutoResolve: true,
        userAction: 'The installer can install Ubuntu automatically, or you can run "wsl --install -d Ubuntu" yourself.'
      })
    } else if (!wslStatus.ubuntuReady) {
      blockers.push({
        code: 'UBUNTU_NOT_WSL2',
        message: wslStatus.reason ?? 'Ubuntu is not running under WSL2.',
        canAutoResolve: true,
        userAction: 'The installer can upgrade Ubuntu to WSL2, or you can run "wsl --set-version Ubuntu 2" yourself.'
      })
    }
  }

  const status = deriveStatus(blockers)

  return { status, windowsVersion, wslStatus, blockers }
}

function deriveStatus(blockers: EnvironmentBlocker[]): EnvironmentStatus {
  if (blockers.length === 0) return 'ready'

  const hasWindowsBlocker =
    blockers.some((b) => b.code === 'WINDOWS_VERSION_TOO_OLD') ||
    blockers.some((b) => b.code === 'WINDOWS_VERSION_UNKNOWN')

  if (hasWindowsBlocker) return 'not_supported'

  return 'needs_setup'
}

/**
 * Returns true only when the environment is fully ready to install.
 */
export function assessmentIsReady(assessment: EnvironmentAssessment): boolean {
  return assessment.status === 'ready'
}

/**
 * Runs all environment checks and returns a complete assessment.
 * Intended for use in the main process only.
 */
export async function runEnvironmentAssessment(mode: InstallMode = 'wsl'): Promise<EnvironmentAssessment> {
  const windowsVersion = detectWindowsVersion()
  const wslStatus = detectWslStatus()
  return buildAssessment(windowsVersion, wslStatus, mode)
}
