import type {
  InstallResult,
  InstallStep,
  StepRecord,
  WslRunner
} from './types'

const INSTALL_COMMAND =
  'curl -fsSL https://openclaw.ai/install.sh | bash -s -- --no-onboard'

export class InstallOrchestrator {
  private readonly steps: StepRecord[] = []

  constructor(private readonly run: WslRunner) {}

  async install(): Promise<InstallResult> {
    // Step 1: detect existing installation
    const alreadyInstalled = await this.detectExisting()
    if (alreadyInstalled) {
      return { state: 'installed', steps: this.steps, alreadyInstalled: true }
    }

    // Step 2: run the install script (non-interactive, skip onboard wizard)
    const scriptOk = await this.runScript()
    if (!scriptOk) {
      return {
        state: 'failed',
        steps: this.steps,
        error: {
          step: 'run_script',
          message: 'OpenClaw installation script failed.',
          cause: 'The install script exited with a non-zero exit code.',
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
          message: 'Install script completed but the openclaw command was not found.',
          cause: 'The script exited successfully but the openclaw binary is still unavailable.',
          recoverable: true
        }
      }
    }

    return { state: 'installed', steps: this.steps }
  }

  private async detectExisting(): Promise<boolean> {
    const result = await this.run('which openclaw')
    const found = result.exitCode === 0
    this.record('detect_existing', true, found
      ? 'Existing OpenClaw installation detected.'
      : 'No existing OpenClaw installation found.')
    return found
  }

  private async runScript(): Promise<boolean> {
    const result = await this.run(INSTALL_COMMAND)
    const ok = result.exitCode === 0
    this.record('run_script', ok, ok
      ? 'OpenClaw install script completed.'
      : `Install script failed (exit ${result.exitCode}): ${result.stderr}`)
    return ok
  }

  private async verifyInstall(): Promise<boolean> {
    const result = await this.run('which openclaw')
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
