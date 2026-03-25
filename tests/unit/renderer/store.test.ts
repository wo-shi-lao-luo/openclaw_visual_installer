import { describe, it, expect, beforeEach } from 'vitest'
import { createInstallerStore } from '../../../implementation/src/renderer/src/store/installer-store'
import type { EnvironmentAssessment } from '../../../implementation/src/main/environment/assessment'
import type { InstallResult, StepRecord } from '../../../implementation/src/main/installer/types'

// --- fixtures ---

const READY_ASSESSMENT: EnvironmentAssessment = {
  status: 'ready',
  blockers: [],
  windowsVersion: { supported: true, buildNumber: 19041 },
  wslStatus: { wslAvailable: true, wsl2Available: true, distros: [], ubuntuDistro: null, ubuntuReady: true }
}

const NOT_SUPPORTED_ASSESSMENT: EnvironmentAssessment = {
  status: 'not_supported',
  blockers: [{ code: 'WINDOWS_VERSION_TOO_OLD', message: 'Too old.', canAutoResolve: false }],
  windowsVersion: { supported: false, buildNumber: 17000, reason: 'Too old.' },
  wslStatus: { wslAvailable: false, wsl2Available: false, distros: [], ubuntuDistro: null, ubuntuReady: false }
}

const NEEDS_SETUP_ASSESSMENT: EnvironmentAssessment = {
  status: 'needs_setup',
  blockers: [{ code: 'WSL_NOT_INSTALLED', message: 'WSL not found.', canAutoResolve: true }],
  windowsVersion: { supported: true, buildNumber: 19041 },
  wslStatus: { wslAvailable: false, wsl2Available: false, distros: [], ubuntuDistro: null, ubuntuReady: false }
}

const INSTALL_SUCCESS: InstallResult = {
  state: 'installed',
  steps: [
    { step: 'detect_existing', success: true, message: 'ok', timestamp: 1 },
    { step: 'run_script', success: true, message: 'ok', timestamp: 2 },
    { step: 'verify', success: true, message: 'ok', timestamp: 3 }
  ]
}

const INSTALL_FAILURE: InstallResult = {
  state: 'failed',
  steps: [{ step: 'run_script', success: false, message: 'failed', timestamp: 1 }],
  error: { step: 'run_script', message: 'Script failed.', recoverable: true }
}

// --- tests ---

describe('installer store', () => {
  let store: ReturnType<typeof createInstallerStore>

  beforeEach(() => {
    store = createInstallerStore()
  })

  describe('initial state', () => {
    it('starts on the welcome page', () => {
      expect(store.getState().page).toBe('welcome')
    })

    it('has no assessment or install result', () => {
      const { assessment, installResult, progressSteps } = store.getState()
      expect(assessment).toBeNull()
      expect(installResult).toBeNull()
      expect(progressSteps).toHaveLength(0)
    })
  })

  describe('setAssessment', () => {
    it('navigates to ready when assessment status is ready', () => {
      store.getState().setAssessment(READY_ASSESSMENT)
      expect(store.getState().page).toBe('ready')
      expect(store.getState().assessment).toBe(READY_ASSESSMENT)
    })

    it('navigates to not_supported when status is not_supported', () => {
      store.getState().setAssessment(NOT_SUPPORTED_ASSESSMENT)
      expect(store.getState().page).toBe('not_supported')
    })

    it('navigates to needs_setup when status is needs_setup', () => {
      store.getState().setAssessment(NEEDS_SETUP_ASSESSMENT)
      expect(store.getState().page).toBe('needs_setup')
    })
  })

  describe('setInstallResult', () => {
    it('navigates to success when state is installed', () => {
      store.getState().setInstallResult(INSTALL_SUCCESS)
      expect(store.getState().page).toBe('success')
      expect(store.getState().installResult).toBe(INSTALL_SUCCESS)
    })

    it('navigates to failure when state is failed', () => {
      store.getState().setInstallResult(INSTALL_FAILURE)
      expect(store.getState().page).toBe('failure')
    })

    it('navigates to failure when state is partial', () => {
      const partial: InstallResult = { ...INSTALL_FAILURE, state: 'partial' }
      store.getState().setInstallResult(partial)
      expect(store.getState().page).toBe('failure')
    })
  })

  describe('addProgressStep', () => {
    it('appends step records without mutating existing array', () => {
      const step: StepRecord = { step: 'run_script', success: true, message: 'ok', timestamp: 1 }
      const before = store.getState().progressSteps

      store.getState().addProgressStep(step)

      const after = store.getState().progressSteps
      expect(after).toHaveLength(1)
      expect(after).not.toBe(before)
    })

    it('accumulates multiple steps in order', () => {
      const s1: StepRecord = { step: 'detect_existing', success: true, message: 'a', timestamp: 1 }
      const s2: StepRecord = { step: 'run_script', success: true, message: 'b', timestamp: 2 }

      store.getState().addProgressStep(s1)
      store.getState().addProgressStep(s2)

      expect(store.getState().progressSteps[0]).toBe(s1)
      expect(store.getState().progressSteps[1]).toBe(s2)
    })
  })

  describe('goTo', () => {
    it('navigates to checking page', () => {
      store.getState().goTo('checking')
      expect(store.getState().page).toBe('checking')
    })

    it('clears progressSteps when navigating to installing', () => {
      const step: StepRecord = { step: 'run_script', success: true, message: 'ok', timestamp: 1 }
      store.getState().addProgressStep(step)

      store.getState().goTo('installing')

      expect(store.getState().progressSteps).toHaveLength(0)
    })
  })
})
