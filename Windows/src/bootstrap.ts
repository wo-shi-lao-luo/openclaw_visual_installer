import { createDiagnosticsEvent, createDiagnosticsReport, logDiagnosticsReport } from './diagnostics/logger.js';
import { detectWindowsEnvironment, type WindowsEnvironmentDetectionOptions } from './environment/windows-checks.js';
import { createPhaseOnePlan } from './installer/orchestrator.js';
import { createAppShellModel } from './shell/AppShell.js';
import type { WindowsInstallerBootstrap } from './shared/types.js';

export interface BootstrapWindowsInstallerOptions extends WindowsEnvironmentDetectionOptions {}

export function bootstrapWindowsInstaller(options: BootstrapWindowsInstallerOptions = {}): WindowsInstallerBootstrap {
  const environment = detectWindowsEnvironment(options);
  const shell = createAppShellModel({ environment });
  const plan = createPhaseOnePlan({ environment, shell });

  const diagnostics = logDiagnosticsReport(
    createDiagnosticsReport('windows-installer', [
      createDiagnosticsEvent('bootstrap', 'info', 'Windows installer bootstrap assembled.', {
        phase: plan.phase,
        ready: plan.ready,
      }),
      ...environment.events,
    ], [...environment.notes, ...shell.notes, ...plan.notes]),
  );

  return {
    shell,
    environment,
    plan,
    diagnostics,
  };
}
