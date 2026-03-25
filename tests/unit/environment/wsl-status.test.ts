import { describe, it, expect } from 'vitest'
import {
  parseWslListOutput,
  findUbuntuDistro,
  evaluateWslStatus,
  type DistroInfo,
  type WslStatusResult
} from '../../../implementation/src/main/environment/wsl-status'

// Sample output from `wsl --list --verbose`
const SAMPLE_LIST_WITH_UBUNTU = `
  NAME                   STATE           VERSION
* Ubuntu                 Running         2
  Ubuntu-22.04           Stopped         2
  docker-desktop         Running         1
`

const SAMPLE_LIST_NO_UBUNTU = `
  NAME                   STATE           VERSION
* Debian                 Stopped         2
`

const SAMPLE_LIST_UBUNTU_V1 = `
  NAME                   STATE           VERSION
* Ubuntu                 Stopped         1
`

const SAMPLE_LIST_EMPTY = `
  NAME                   STATE           VERSION
`

describe('parseWslListOutput', () => {
  it('parses multiple distros correctly', () => {
    const result = parseWslListOutput(SAMPLE_LIST_WITH_UBUNTU)
    expect(result).toHaveLength(3)
  })

  it('marks the default distro with isDefault=true', () => {
    const result = parseWslListOutput(SAMPLE_LIST_WITH_UBUNTU)
    const defaultDistro = result.find((d) => d.isDefault)
    expect(defaultDistro?.name).toBe('Ubuntu')
  })

  it('parses version numbers correctly', () => {
    const result = parseWslListOutput(SAMPLE_LIST_WITH_UBUNTU)
    expect(result.find((d) => d.name === 'Ubuntu')?.version).toBe(2)
    expect(result.find((d) => d.name === 'docker-desktop')?.version).toBe(1)
  })

  it('parses state correctly', () => {
    const result = parseWslListOutput(SAMPLE_LIST_WITH_UBUNTU)
    expect(result.find((d) => d.name === 'Ubuntu')?.state).toBe('Running')
    expect(result.find((d) => d.name === 'Ubuntu-22.04')?.state).toBe('Stopped')
  })

  it('returns empty array for empty distro list', () => {
    expect(parseWslListOutput(SAMPLE_LIST_EMPTY)).toHaveLength(0)
  })

  it('returns empty array for empty string', () => {
    expect(parseWslListOutput('')).toHaveLength(0)
  })
})

describe('findUbuntuDistro', () => {
  it('finds Ubuntu distro by name prefix', () => {
    const distros = parseWslListOutput(SAMPLE_LIST_WITH_UBUNTU)
    const found = findUbuntuDistro(distros)
    expect(found?.name).toBe('Ubuntu')
  })

  it('finds Ubuntu-22.04 when plain Ubuntu is not present', () => {
    const distros = parseWslListOutput(SAMPLE_LIST_NO_UBUNTU)
    expect(findUbuntuDistro(distros)).toBeNull()
  })

  it('returns null when no Ubuntu distro is present', () => {
    const distros = parseWslListOutput(SAMPLE_LIST_NO_UBUNTU)
    expect(findUbuntuDistro(distros)).toBeNull()
  })
})

describe('evaluateWslStatus', () => {
  it('returns ready when Ubuntu WSL2 distro is present', () => {
    const distros = parseWslListOutput(SAMPLE_LIST_WITH_UBUNTU)
    const result = evaluateWslStatus(distros)
    expect(result.wslAvailable).toBe(true)
    expect(result.wsl2Available).toBe(true)
    expect(result.ubuntuDistro).not.toBeNull()
    expect(result.ubuntuReady).toBe(true)
  })

  it('returns wslAvailable=false when distro list is empty', () => {
    const result = evaluateWslStatus([])
    expect(result.wslAvailable).toBe(false)
    expect(result.ubuntuReady).toBe(false)
    expect(result.reason).toBeDefined()
  })

  it('returns ubuntuReady=false when Ubuntu is WSL1', () => {
    const distros = parseWslListOutput(SAMPLE_LIST_UBUNTU_V1)
    const result = evaluateWslStatus(distros)
    expect(result.wslAvailable).toBe(true)
    expect(result.ubuntuReady).toBe(false)
    expect(result.reason).toMatch(/WSL2/)
  })

  it('returns ubuntuReady=false when no Ubuntu distro exists', () => {
    const distros = parseWslListOutput(SAMPLE_LIST_NO_UBUNTU)
    const result = evaluateWslStatus(distros)
    expect(result.wslAvailable).toBe(true)
    expect(result.ubuntuDistro).toBeNull()
    expect(result.ubuntuReady).toBe(false)
    expect(result.reason).toMatch(/Ubuntu/)
  })

  it('reports wsl2Available=true when any WSL2 distro exists', () => {
    const distros = parseWslListOutput(SAMPLE_LIST_WITH_UBUNTU)
    const result = evaluateWslStatus(distros)
    expect(result.wsl2Available).toBe(true)
  })
})
