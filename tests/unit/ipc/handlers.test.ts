import { describe, it, expect, vi } from 'vitest'
import { createCheckEnvironmentHandler, createStartInstallHandler } from '../../../implementation/src/main/ipc/handlers'
import type { EnvironmentAssessment } from '../../../implementation/src/main/environment/assessment'
import type { InstallResult } from '../../../implementation/src/main/installer/types'

// --- fixtures ---

const READY_ASSESSMENT: EnvironmentAssessment = {
  status: 'ready',
  blockers: [],
  windowsVersion: { supported: true, buildNumber: 19041 },
  wslStatus: {
    wslAvailable: true,
    wsl2Available: true,
    distros: [],
    ubuntuDistro: null,
    ubuntuReady: true
  }
}

const INSTALL_SUCCESS: InstallResult = {
  state: 'installed',
  steps: [
    { step: 'detect_existing', success: true, message: 'Not found.', timestamp: 1 },
    { step: 'run_script', success: true, message: 'Script ok.', timestamp: 2 },
    { step: 'verify', success: true, message: 'Verified.', timestamp: 3 }
  ]
}

const INSTALL_FAILURE: InstallResult = {
  state: 'failed',
  steps: [
    { step: 'detect_existing', success: true, message: 'Not found.', timestamp: 1 },
    { step: 'run_script', success: false, message: 'Script failed.', timestamp: 2 }
  ],
  error: { step: 'run_script', message: 'Script failed.', recoverable: true }
}

// --- tests ---

describe('createCheckEnvironmentHandler', () => {
  it('returns the assessment from the provided assess function', async () => {
    const assess = vi.fn(async () => READY_ASSESSMENT)
    const handler = createCheckEnvironmentHandler(assess)

    const result = await handler()

    expect(result).toBe(READY_ASSESSMENT)
    expect(assess).toHaveBeenCalledOnce()
  })

  it('propagates errors from the assess function', async () => {
    const assess = vi.fn(async () => { throw new Error('PowerShell unavailable') })
    const handler = createCheckEnvironmentHandler(assess)

    await expect(handler()).rejects.toThrow('PowerShell unavailable')
  })
})

describe('createStartInstallHandler', () => {
  it('returns the install result from the provided install function', async () => {
    const install = vi.fn(async () => INSTALL_SUCCESS)
    const onProgress = vi.fn()
    const handler = createStartInstallHandler(install, onProgress)

    const result = await handler()

    expect(result).toBe(INSTALL_SUCCESS)
    expect(install).toHaveBeenCalledOnce()
  })

  it('calls onProgress for each step record after install completes', async () => {
    const install = vi.fn(async () => INSTALL_SUCCESS)
    const onProgress = vi.fn()
    const handler = createStartInstallHandler(install, onProgress)

    await handler()

    expect(onProgress).toHaveBeenCalledTimes(INSTALL_SUCCESS.steps.length)
    expect(onProgress).toHaveBeenCalledWith(INSTALL_SUCCESS.steps[0])
  })

  it('still calls onProgress even when install fails', async () => {
    const install = vi.fn(async () => INSTALL_FAILURE)
    const onProgress = vi.fn()
    const handler = createStartInstallHandler(install, onProgress)

    const result = await handler()

    expect(result.state).toBe('failed')
    expect(onProgress).toHaveBeenCalledTimes(INSTALL_FAILURE.steps.length)
  })

  it('returns the result even if onProgress throws', async () => {
    const install = vi.fn(async () => INSTALL_SUCCESS)
    const onProgress = vi.fn(() => { throw new Error('send failed') })
    const handler = createStartInstallHandler(install, onProgress)

    const result = await handler()

    expect(result).toBe(INSTALL_SUCCESS)
  })
})
