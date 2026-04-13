import { describe, it, expect, vi } from 'vitest'
import {
  parseWindowsBuildNumber,
  isWindowsVersionSupported,
  checkWindowsVersion,
  MIN_SUPPORTED_BUILD
} from '../../../src/main/environment/windows-version'

describe('parseWindowsBuildNumber', () => {
  it('parses a standard version string', () => {
    expect(parseWindowsBuildNumber('10.0.19041')).toBe(19041)
  })

  it('parses a Windows 11 build', () => {
    expect(parseWindowsBuildNumber('10.0.22000')).toBe(22000)
  })

  it('returns null for an unrecognised format', () => {
    expect(parseWindowsBuildNumber('not-a-version')).toBeNull()
  })

  it('returns null for an empty string', () => {
    expect(parseWindowsBuildNumber('')).toBeNull()
  })
})

describe('isWindowsVersionSupported', () => {
  it('returns true for the minimum supported build', () => {
    expect(isWindowsVersionSupported(MIN_SUPPORTED_BUILD)).toBe(true)
  })

  it('returns true for a newer build', () => {
    expect(isWindowsVersionSupported(22000)).toBe(true)
  })

  it('returns false for a build below the minimum', () => {
    expect(isWindowsVersionSupported(18363)).toBe(false)
  })
})

describe('checkWindowsVersion', () => {
  it('returns supported result when build meets the requirement', () => {
    const result = checkWindowsVersion('10.0.19041')
    expect(result.supported).toBe(true)
    expect(result.buildNumber).toBe(19041)
    expect(result.reason).toBeUndefined()
  })

  it('returns unsupported result when build is too old', () => {
    const result = checkWindowsVersion('10.0.18363')
    expect(result.supported).toBe(false)
    expect(result.buildNumber).toBe(18363)
    expect(result.reason).toMatch(/19041/)
  })

  it('returns unsupported result when version string is unreadable', () => {
    const result = checkWindowsVersion('unknown')
    expect(result.supported).toBe(false)
    expect(result.buildNumber).toBeNull()
    expect(result.reason).toBeDefined()
  })
})
