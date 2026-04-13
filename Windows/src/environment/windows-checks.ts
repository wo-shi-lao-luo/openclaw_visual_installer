import { createDiagnosticsEvent } from '../diagnostics/logger.js';
import type { EnvironmentCheckItem, EnvironmentCheckResult, InstallerNote } from '../shared/types.js';

export interface WindowsEnvironmentDetectionOptions {
  platform?: NodeJS.Platform;
}

export function detectWindowsEnvironment(options: WindowsEnvironmentDetectionOptions = {}): EnvironmentCheckResult {
  const platform = options.platform ?? process.platform;
  const supportedPlatform = platform === 'win32';

  const checks: EnvironmentCheckItem[] = [
    {
      id: 'platform-windows',
      label: 'Windows platform',
      passed: supportedPlatform,
      message: supportedPlatform
        ? 'A Windows host platform was detected.'
        : `Detected ${platform}, so the Windows installer MVP is not supported on this host.`,
    },
    {
      id: 'host-pending',
      label: 'Host choice pending',
      passed: true,
      message: 'Electron or Tauri has not been selected yet, so the scaffold stays framework-agnostic.',
    },
  ];

  const supported = checks.every((check) => check.passed);

  const notes: InstallerNote[] = supported
    ? [
        {
          code: 'windows-environment-supported',
          level: 'info',
          message: 'Windows Phase 1 scaffold is supported on this machine path.',
        },
      ]
    : [
        {
          code: 'windows-environment-blocked',
          level: 'error',
          message: 'Windows installer MVP needs to run on a Windows host.',
        },
      ];

  const events = [
    createDiagnosticsEvent('environment', 'info', 'Windows environment checks evaluated.', {
      supported,
      platform,
      checks: checks.map((check) => ({ id: check.id, passed: check.passed })),
    }),
  ];

  return {
    platform: 'windows',
    supported,
    checks,
    notes,
    events,
  };
}
