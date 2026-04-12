import type {
  InstallResult,
  InstallStep,
  StepRecord,
  CommandRunner
} from './types'

export interface OrchestratorConfig {
  /** Command used to detect an existing installation (exit 0 = found). */
  detectCommand: string
  /** Command used to install OpenClaw. */
  installCommand: string
  /** Command used to verify the binary after install (exit 0 = found). */
  verifyCommand: string
}

const WSL_CONFIG: OrchestratorConfig = {
  detectCommand: 'which openclaw',
  installCommand: 'curl -fsSL https://openclaw.ai/install.sh | bash -s -- --no-onboard',
  verifyCommand: 'which openclaw'
}

const NATIVE_CONFIG: OrchestratorConfig = {
  detectCommand: 'where openclaw',
  installCommand: 'npm i -g openclaw',
  verifyCommand: 'where openclaw'
}

export class InstallOrchestrator {
  private readonly steps: StepRecord[] = []

  constructor(
    private readonly run: CommandRunner,
    private readonly config: OrchestratorConfig = WSL_CONFIG
  ) {}

  async install(): Promise<InstallResult> {
    // Step 1: detect existing installation
    const alreadyInstalled = await this.detectExisting()
    if (alreadyInstalled) {
      return { state: 'installed', steps: this.steps, alreadyInstalled: true }
    }

    // Step 2: run the install command
    const scriptOk = await this.runScript()
    if (!scriptOk) {
      return {
        state: 'failed',
        steps: this.steps,
        error: {
          step: 'run_script',
          message: 'OpenClaw installation failed.',
          cause: 'The install command exited with a non-zero exit code.',
          recoverable: true
        }
      }
    }

    // Step 3: verify the binary is present
    const binaryOk = await this.verifyInstall()
    if (!binaryOk) {
      return {
        state: 'partial',
        steps: this.steps,
        error: {
          step: 'verify_install',
          message: 'Install completed but the openclaw command was not found.',
          cause: 'The install command exited successfully but the openclaw binary is still unavailable.',
          recoverable: true
        }
      }
    }

    return { state: 'installed', steps: this.steps }
  }

  private async detectExisting(): Promise<boolean> {
    const result = await this.run(this.config.detectCommand)
    const found = result.exitCode === 0
    this.record('detect_existing', true, found
      ? 'Existing OpenClaw installation detected.'
      : 'No existing OpenClaw installation found.')
    return found
  }

  private async runScript(): Promise<boolean> {
    const result = await this.run(this.config.installCommand)
    const ok = result.exitCode === 0
    this.record('run_script', ok, ok
      ? 'OpenClaw install completed.'
      : `Install failed (exit ${result.exitCode}): ${result.stderr}`)
    return ok
  }

  private async verifyInstall(): Promise<boolean> {
    const result = await this.run(this.config.verifyCommand)
    const found = result.exitCode === 0
    this.record('verify_install', found, found
      ? 'openclaw binary found.'
      : 'openclaw binary not found after install.')
    return found
  }

  private record(step: InstallStep, success: boolean, message: string): void {
    this.steps.push({ step, success, message, timestamp: Date.now() })
  }
}

/**
 * Creates an orchestrator pre-configured for WSL installation.
 * Uses `which openclaw` for detection and the official install script.
 */
export function createWslOrchestrator(run: CommandRunner): InstallOrchestrator {
  return new InstallOrchestrator(run, WSL_CONFIG)
}

/**
 * Creates an orchestrator pre-configured for native Windows installation.
 * Uses `where openclaw` for detection and `npm i -g openclaw` for install.
 */
export function createNativeOrchestrator(run: CommandRunner): InstallOrchestrator {
  return new InstallOrchestrator(run, NATIVE_CONFIG)
}
