export type InstallMode = 'wsl' | 'native'

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

export interface CommandResult {
  stdout: string
  stderr: string
  exitCode: number
}

/**
 * Abstraction over shell command execution.
 * Injected into the orchestrator so tests can mock it without touching real WSL or the host shell.
 */
export type CommandRunner = (command: string) => Promise<CommandResult>

/** @deprecated Use CommandResult */
export type WslCommandResult = CommandResult
/** @deprecated Use CommandRunner */
export type WslRunner = CommandRunner
