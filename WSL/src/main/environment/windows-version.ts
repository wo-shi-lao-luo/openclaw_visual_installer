import { execSync } from 'child_process'

export const MIN_SUPPORTED_BUILD = 19041

export interface WindowsVersionResult {
  supported: boolean
  buildNumber: number | null
  reason?: string
}

/**
 * Parses a Windows version string (e.g. "10.0.19041") and returns the build number.
 * Returns null if the string does not match the expected format.
 */
export function parseWindowsBuildNumber(version: string): number | null {
  const match = version.match(/^\d+\.\d+\.(\d+)/)
  if (!match) return null
  const build = parseInt(match[1], 10)
  return isNaN(build) ? null : build
}

/**
 * Returns true if the given build number meets the minimum requirement for WSL2 native support.
 */
export function isWindowsVersionSupported(buildNumber: number): boolean {
  return buildNumber >= MIN_SUPPORTED_BUILD
}

/**
 * Checks the Windows version from a version string and returns a structured result.
 */
export function checkWindowsVersion(versionString: string): WindowsVersionResult {
  const buildNumber = parseWindowsBuildNumber(versionString)

  if (buildNumber === null) {
    return {
      supported: false,
      buildNumber: null,
      reason: `Could not read Windows version from "${versionString}". Manual verification required.`
    }
  }

  if (!isWindowsVersionSupported(buildNumber)) {
    return {
      supported: false,
      buildNumber,
      reason: `Windows Build ${buildNumber} is below the minimum required build ${MIN_SUPPORTED_BUILD} (Windows 10 version 2004). WSL2 is not natively supported on this version.`
    }
  }

  return { supported: true, buildNumber }
}

/**
 * Reads the Windows version from the registry via PowerShell and returns a structured result.
 * This is the live check intended for use in the main process.
 */
export function detectWindowsVersion(): WindowsVersionResult {
  try {
    const raw = execSync(
      'powershell.exe -NoProfile -Command "[System.Environment]::OSVersion.Version.ToString()"',
      { encoding: 'utf8', timeout: 5000 }
    ).trim()
    return checkWindowsVersion(raw)
  } catch {
    return {
      supported: false,
      buildNumber: null,
      reason: 'Failed to query Windows version. Ensure PowerShell is accessible from WSL.'
    }
  }
}
