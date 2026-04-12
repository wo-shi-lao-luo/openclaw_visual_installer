import { describe, it, expect, vi } from 'vitest'
import { createNativeOrchestrator, createWslOrchestrator } from '../../../implementation/src/main/installer/orchestrator'
import type { CommandRunner, CommandResult } from '../../../implementation/src/main/installer/types'

const SUCCESS: CommandResult = { stdout: 'ok', stderr: '', exitCode: 0 }
const FAILURE: CommandResult = { stdout: '', stderr: 'error', exitCode: 1 }
const NOT_FOUND: CommandResult = { stdout: '', stderr: 'not found', exitCode: 1 }

function makeRunner(responses: Record<string, CommandResult>): CommandRunner {
  return vi.fn(async (command: string) => {
    for (const [pattern, result] of Object.entries(responses)) {
      if (command.includes(pattern)) return result
    }
    return NOT_FOUND
  })
}

describe('InstallOrchestrator', () => {
  describe('WSL mode', () => {
    it('returns state=installed without running the script when openclaw already exists', async () => {
      const runner = makeRunner({ 'which openclaw': SUCCESS })
      const result = await createWslOrchestrator(runner).install()

      expect(result.state).toBe('installed')
      expect(result.steps).toHaveLength(1)
      expect(result.steps[0].step).toBe('detect_existing')
      expect(result.steps.some((s) => s.step === 'run_script')).toBe(false)
    })

    it('proceeds to run_script when openclaw is absent', async () => {
      let whichCount = 0
      const runner = vi.fn(async (command: string) => {
        if (command.includes('which openclaw')) {
          whichCount += 1
          return whichCount === 1 ? NOT_FOUND : SUCCESS
        }
        if (command.includes('--no-onboard')) return SUCCESS
        return NOT_FOUND
      }) as CommandRunner

      const result = await createWslOrchestrator(runner).install()

      expect(result.steps.some((s) => s.step === 'run_script')).toBe(true)
      expect(result.state).toBe('installed')
    })

    it('returns state=failed when the script exits non-zero', async () => {
      const runner = makeRunner({ 'which openclaw': NOT_FOUND, '--no-onboard': FAILURE })
      const result = await createWslOrchestrator(runner).install()

      expect(result.state).toBe('failed')
      expect(result.error?.step).toBe('run_script')
      expect(result.error?.recoverable).toBe(true)
    })
  })

  describe('native mode', () => {
    it('uses where openclaw and npm i -g openclaw', async () => {
      let whereCount = 0
      const runner = vi.fn(async (command: string) => {
        if (command.includes('where openclaw')) {
          whereCount += 1
          return whereCount === 1 ? NOT_FOUND : SUCCESS
        }
        if (command.includes('npm i -g openclaw')) return SUCCESS
        return NOT_FOUND
      }) as CommandRunner

      const result = await createNativeOrchestrator(runner).install()

      expect(result.state).toBe('installed')
      expect((runner as ReturnType<typeof vi.fn>).mock.calls.some((c) => String(c[0]).includes('where openclaw'))).toBe(true)
      expect((runner as ReturnType<typeof vi.fn>).mock.calls.some((c) => String(c[0]).includes('npm i -g openclaw'))).toBe(true)
    })

    it('returns state=failed when npm install fails', async () => {
      const runner = makeRunner({ 'where openclaw': NOT_FOUND, 'npm i -g openclaw': FAILURE })
      const result = await createNativeOrchestrator(runner).install()

      expect(result.state).toBe('failed')
      expect(result.error?.step).toBe('run_script')
    })
  })

  describe('step records', () => {
    it('each step has a timestamp', async () => {
      const runner = makeRunner({ 'which openclaw': NOT_FOUND, '--no-onboard': FAILURE })
      const result = await createWslOrchestrator(runner).install()

      for (const step of result.steps) {
        expect(step.timestamp).toBeGreaterThan(0)
      }
    })

    it('steps are recorded in order: detect_existing first', async () => {
      const runner = makeRunner({ 'which openclaw': NOT_FOUND, '--no-onboard': FAILURE })
      const result = await createWslOrchestrator(runner).install()

      expect(result.steps[0].step).toBe('detect_existing')
      expect(result.steps[1].step).toBe('run_script')
    })
  })
})
