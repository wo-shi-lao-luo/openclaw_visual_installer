import { describe, it, expect, vi } from 'vitest'
import { InstallOrchestrator } from '../../../implementation/src/main/installer/orchestrator'
import type { WslRunner, WslCommandResult } from '../../../implementation/src/main/installer/types'

const SUCCESS: WslCommandResult = { stdout: 'ok', stderr: '', exitCode: 0 }
const FAILURE: WslCommandResult = { stdout: '', stderr: 'error', exitCode: 1 }
const NOT_FOUND: WslCommandResult = { stdout: '', stderr: 'not found', exitCode: 1 }

function makeRunner(responses: Record<string, WslCommandResult>): WslRunner {
  return vi.fn(async (command: string) => {
    for (const [pattern, result] of Object.entries(responses)) {
      if (command.includes(pattern)) return result
    }
    return NOT_FOUND
  })
}

describe('InstallOrchestrator', () => {
  describe('detect_existing', () => {
    it('returns state=installed without running the script when openclaw already exists', async () => {
      const runner = makeRunner({ 'which openclaw': SUCCESS })
      const result = await new InstallOrchestrator(runner).install()

      expect(result.state).toBe('installed')
      expect(result.steps).toHaveLength(1)
      expect(result.steps[0].step).toBe('detect_existing')
      expect(result.steps.some((s) => s.step === 'run_script')).toBe(false)
    })

    it('proceeds to run_script when openclaw is absent', async () => {
      const runner = makeRunner({ '--no-onboard': FAILURE })
      const result = await new InstallOrchestrator(runner).install()

      expect(result.steps.some((s) => s.step === 'run_script')).toBe(true)
    })
  })

  describe('run_script', () => {
    it('uses the --no-onboard flag', async () => {
      const runner = makeRunner({ '--no-onboard': FAILURE })
      await new InstallOrchestrator(runner).install()

      const calls = (runner as ReturnType<typeof vi.fn>).mock.calls.map((c) => c[0] as string)
      expect(calls.some((c) => c.includes('--no-onboard'))).toBe(true)
    })

    it('returns state=failed when the script exits non-zero', async () => {
      const runner = makeRunner({ '--no-onboard': FAILURE })
      const result = await new InstallOrchestrator(runner).install()

      expect(result.state).toBe('failed')
      expect(result.error?.step).toBe('run_script')
      expect(result.error?.recoverable).toBe(true)
    })
  })

  describe('verify_install', () => {
    it('returns state=installed when binary is found after install', async () => {
      let whichCount = 0
      const runner = vi.fn(async (command: string) => {
        if (command.includes('which openclaw')) {
          whichCount++
          return whichCount === 1 ? NOT_FOUND : SUCCESS
        }
        if (command.includes('--no-onboard')) return SUCCESS
        return NOT_FOUND
      }) as WslRunner

      const result = await new InstallOrchestrator(runner).install()

      expect(result.state).toBe('installed')
      expect(result.steps.find((s) => s.step === 'verify_install')?.success).toBe(true)
    })

    it('returns state=partial when script exits 0 but binary is still missing', async () => {
      const runner = makeRunner({ '--no-onboard': SUCCESS })
      const result = await new InstallOrchestrator(runner).install()

      expect(result.state).toBe('partial')
      expect(result.error?.step).toBe('verify_install')
      expect(result.error?.recoverable).toBe(true)
    })
  })

  describe('step records', () => {
    it('each step has a timestamp', async () => {
      const runner = makeRunner({ '--no-onboard': FAILURE })
      const result = await new InstallOrchestrator(runner).install()

      for (const step of result.steps) {
        expect(step.timestamp).toBeGreaterThan(0)
      }
    })

    it('steps are recorded in order: detect_existing first', async () => {
      const runner = makeRunner({ '--no-onboard': FAILURE })
      const result = await new InstallOrchestrator(runner).install()

      expect(result.steps[0].step).toBe('detect_existing')
      expect(result.steps[1].step).toBe('run_script')
    })
  })
})
