export type InstallState =
  | 'not_installed'
  | 'installing'
  | 'installed'
  | 'partial'
  | 'failed'
  | 'repairable'

export type InstallStep =
  | 'detect_existing'
  | 'run_script'
  | 'verify_install'
  | 'start_gateway'
  | 'verify_gateway'

export interface StepRecord {
  step: InstallStep
  success: boolean
  message: string
  timestamp: number
}

export interface InstallError {
  step: InstallStep
  message: string
  cause?: string
  recoverable: boolean
}

export interface InstallResult {
  state: InstallState
  steps: StepRecord[]
  alreadyInstalled?: boolean
  error?: InstallError
}

export interface WslCommandResult {
  stdout: string
  stderr: string
  exitCode: number
}

/**
 * Abstraction over WSL command execution.
 * Injected into the orchestrator so tests can mock it without touching real WSL.
 */
export type WslRunner = (command: string, distro?: string) => Promise<WslCommandResult>
