import { execSync } from 'child_process'

export interface DistroInfo {
  name: string
  state: 'Running' | 'Stopped' | 'Installing' | 'Unknown'
  version: 1 | 2
  isDefault: boolean
}

export interface WslStatusResult {
  wslAvailable: boolean
  wsl2Available: boolean
  distros: DistroInfo[]
  ubuntuDistro: DistroInfo | null
  ubuntuReady: boolean
  reason?: string
}

/**
 * Parses the output of `wsl --list --verbose` into structured DistroInfo objects.
 *
 * Example input line:
 *   * Ubuntu                 Running         2
 *     Ubuntu-22.04           Stopped         2
 */
export function parseWslListOutput(raw: string): DistroInfo[] {
  const lines = raw.split('\n')
  const distros: DistroInfo[] = []

  for (const line of lines) {
    // Strip BOM and control characters that wsl.exe sometimes outputs
    const cleaned = line.replace(/\0/g, '').replace(/\r/g, '').trimEnd()

    // Match: optional leading `*`, whitespace, name, state, version
    const match = cleaned.match(/^(\*?)\s+([\w.-]+)\s+(Running|Stopped|Installing)\s+(1|2)\s*$/)
    if (!match) continue

    distros.push({
      isDefault: match[1] === '*',
      name: match[2],
      state: match[3] as DistroInfo['state'],
      version: parseInt(match[4], 10) as 1 | 2
    })
  }

  return distros
}

/**
 * Returns the first Ubuntu distro found (prefers plain "Ubuntu" over versioned variants).
 */
export function findUbuntuDistro(distros: DistroInfo[]): DistroInfo | null {
  return (
    distros.find((d) => d.name === 'Ubuntu') ??
    distros.find((d) => d.name.startsWith('Ubuntu-')) ??
    null
  )
}

/**
 * Evaluates a list of distros and returns a structured status result.
 */
export function evaluateWslStatus(distros: DistroInfo[]): WslStatusResult {
  if (distros.length === 0) {
    return {
      wslAvailable: false,
      wsl2Available: false,
      distros: [],
      ubuntuDistro: null,
      ubuntuReady: false,
      reason: 'No WSL distributions found. WSL may not be installed or enabled.'
    }
  }

  const wsl2Available = distros.some((d) => d.version === 2)
  const ubuntuDistro = findUbuntuDistro(distros)

  if (!ubuntuDistro) {
    return {
      wslAvailable: true,
      wsl2Available,
      distros,
      ubuntuDistro: null,
      ubuntuReady: false,
      reason: 'No Ubuntu distribution found. OpenClaw requires Ubuntu to be installed in WSL.'
    }
  }

  if (ubuntuDistro.version !== 2) {
    return {
      wslAvailable: true,
      wsl2Available,
      distros,
      ubuntuDistro,
      ubuntuReady: false,
      reason: `Ubuntu is running under WSL1. WSL2 is required. Run "wsl --set-version Ubuntu 2" to upgrade.`
    }
  }

  return {
    wslAvailable: true,
    wsl2Available: true,
    distros,
    ubuntuDistro,
    ubuntuReady: true
  }
}

/**
 * Runs `wsl --list --verbose` and returns a structured status result.
 * Intended for use in the main process only.
 */
export function detectWslStatus(): WslStatusResult {
  try {
    const raw = execSync('wsl.exe --list --verbose', {
      encoding: 'utf8',
      timeout: 10000
    })
    const distros = parseWslListOutput(raw)
    return evaluateWslStatus(distros)
  } catch {
    return {
      wslAvailable: false,
      wsl2Available: false,
      distros: [],
      ubuntuDistro: null,
      ubuntuReady: false,
      reason: 'WSL is not available or not installed on this system.'
    }
  }
}
