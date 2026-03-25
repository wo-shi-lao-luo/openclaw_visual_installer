import { describe, it, expect } from 'vitest'
import {
  buildAssessment,
  assessmentIsReady,
  type EnvironmentAssessment
} from '../../../implementation/src/main/environment/assessment'
import type { WindowsVersionResult } from '../../../implementation/src/main/environment/windows-version'
import type { WslStatusResult, DistroInfo } from '../../../implementation/src/main/environment/wsl-status'

// --- fixtures ---

const WIN_SUPPORTED: WindowsVersionResult = { supported: true, buildNumber: 19041 }
const WIN_TOO_OLD: WindowsVersionResult = {
  supported: false,
  buildNumber: 18363,
  reason: 'Build 18363 is below minimum 19041.'
}
const WIN_UNKNOWN: WindowsVersionResult = {
  supported: false,
  buildNumber: null,
  reason: 'Could not read Windows version.'
}

const ubuntu: DistroInfo = { name: 'Ubuntu', state: 'Stopped', version: 2, isDefault: true }
const ubuntuV1: DistroInfo = { name: 'Ubuntu', state: 'Stopped', version: 1, isDefault: true }

const WSL_READY: WslStatusResult = {
  wslAvailable: true,
  wsl2Available: true,
  distros: [ubuntu],
  ubuntuDistro: ubuntu,
  ubuntuReady: true
}
const WSL_NOT_INSTALLED: WslStatusResult = {
  wslAvailable: false,
  wsl2Available: false,
  distros: [],
  ubuntuDistro: null,
  ubuntuReady: false,
  reason: 'WSL is not available.'
}
const WSL_NO_UBUNTU: WslStatusResult = {
  wslAvailable: true,
  wsl2Available: true,
  distros: [],
  ubuntuDistro: null,
  ubuntuReady: false,
  reason: 'No Ubuntu distribution found.'
}
const WSL_UBUNTU_V1: WslStatusResult = {
  wslAvailable: true,
  wsl2Available: false,
  distros: [ubuntuV1],
  ubuntuDistro: ubuntuV1,
  ubuntuReady: false,
  reason: 'Ubuntu is running under WSL1.'
}

// --- tests ---

describe('buildAssessment', () => {
  it('returns status=ready when Windows and WSL are both satisfied', () => {
    const result = buildAssessment(WIN_SUPPORTED, WSL_READY)
    expect(result.status).toBe('ready')
    expect(result.blockers).toHaveLength(0)
  })

  it('returns status=not_supported when Windows version is too old', () => {
    const result = buildAssessment(WIN_TOO_OLD, WSL_READY)
    expect(result.status).toBe('not_supported')
    expect(result.blockers.some((b) => b.code === 'WINDOWS_VERSION_TOO_OLD')).toBe(true)
  })

  it('returns status=not_supported when Windows version is unknown', () => {
    const result = buildAssessment(WIN_UNKNOWN, WSL_READY)
    expect(result.status).toBe('not_supported')
    expect(result.blockers.some((b) => b.code === 'WINDOWS_VERSION_UNKNOWN')).toBe(true)
  })

  it('returns status=needs_setup when WSL is not installed', () => {
    const result = buildAssessment(WIN_SUPPORTED, WSL_NOT_INSTALLED)
    expect(result.status).toBe('needs_setup')
    expect(result.blockers.some((b) => b.code === 'WSL_NOT_INSTALLED')).toBe(true)
  })

  it('returns status=needs_setup when Ubuntu is missing', () => {
    const result = buildAssessment(WIN_SUPPORTED, WSL_NO_UBUNTU)
    expect(result.status).toBe('needs_setup')
    expect(result.blockers.some((b) => b.code === 'UBUNTU_NOT_INSTALLED')).toBe(true)
  })

  it('returns status=needs_setup when Ubuntu is WSL1', () => {
    const result = buildAssessment(WIN_SUPPORTED, WSL_UBUNTU_V1)
    expect(result.status).toBe('needs_setup')
    expect(result.blockers.some((b) => b.code === 'UBUNTU_NOT_WSL2')).toBe(true)
  })

  it('accumulates multiple blockers when both Windows and WSL fail', () => {
    const result = buildAssessment(WIN_TOO_OLD, WSL_NOT_INSTALLED)
    expect(result.blockers.length).toBeGreaterThan(1)
  })

  it('marks WSL_NOT_INSTALLED as canAutoResolve=true', () => {
    const result = buildAssessment(WIN_SUPPORTED, WSL_NOT_INSTALLED)
    const blocker = result.blockers.find((b) => b.code === 'WSL_NOT_INSTALLED')
    expect(blocker?.canAutoResolve).toBe(true)
  })

  it('marks WINDOWS_VERSION_TOO_OLD as canAutoResolve=false', () => {
    const result = buildAssessment(WIN_TOO_OLD, WSL_READY)
    const blocker = result.blockers.find((b) => b.code === 'WINDOWS_VERSION_TOO_OLD')
    expect(blocker?.canAutoResolve).toBe(false)
  })

  it('includes the raw windowsVersion and wslStatus in the result', () => {
    const result = buildAssessment(WIN_SUPPORTED, WSL_READY)
    expect(result.windowsVersion).toBe(WIN_SUPPORTED)
    expect(result.wslStatus).toBe(WSL_READY)
  })
})

describe('assessmentIsReady', () => {
  it('returns true when status is ready', () => {
    const assessment = buildAssessment(WIN_SUPPORTED, WSL_READY)
    expect(assessmentIsReady(assessment)).toBe(true)
  })

  it('returns false when status is not_supported', () => {
    const assessment = buildAssessment(WIN_TOO_OLD, WSL_READY)
    expect(assessmentIsReady(assessment)).toBe(false)
  })

  it('returns false when status is needs_setup', () => {
    const assessment = buildAssessment(WIN_SUPPORTED, WSL_NOT_INSTALLED)
    expect(assessmentIsReady(assessment)).toBe(false)
  })
})
