/**
 * Windows 10 October 2018 Update — the minimum supported build for this installer.
 * Corresponds to Windows 10 1809 / build 17763.
 */
export const WINDOWS_MIN_BUILD = 17763;

export interface OsCheckResult {
  supported: boolean;
  buildNumber: number | null;
  reason?: string;
}

/**
 * Parses a Windows release string (e.g. os.release() output "10.0.17763") and
 * checks whether the build number meets the minimum requirement.
 */
export function checkWindowsMinimumBuild(release: string): OsCheckResult {
  const parts = release.split('.');
  const buildStr = parts[2];
  const buildNumber = buildStr !== undefined ? parseInt(buildStr, 10) : NaN;

  if (isNaN(buildNumber)) {
    return {
      supported: false,
      buildNumber: null,
      reason: `Could not parse build number from OS release string: "${release}"`,
    };
  }

  if (buildNumber < WINDOWS_MIN_BUILD) {
    return {
      supported: false,
      buildNumber,
      reason:
        `Windows build ${buildNumber} is below the minimum required build ` +
        `${WINDOWS_MIN_BUILD} (Windows 10 1809). Please update Windows.`,
    };
  }

  return { supported: true, buildNumber };
}
