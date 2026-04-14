export { bootstrapWindowsInstaller } from './bootstrap.js';
export { createDiagnosticsEvent, createDiagnosticsReport, logDiagnosticsReport } from './diagnostics/logger.js';
export { detectWindowsEnvironment } from './environment/windows-checks.js';
export { createPhaseOnePlan } from './installer/orchestrator.js';
export { runPowerShellCommand, runProcess } from './powershell/ps-runner.js';
export { installOpenClaw, buildInstallCommand, OPENCLAW_INSTALL_SCRIPT_URL, NODE_VERSION, NODE_DOWNLOAD_URL } from './openclaw/openclaw-install.js';
export { verifyOpenClaw, OPENCLAW_GATEWAY_PORT } from './openclaw/openclaw-verify.js';
export { createAppShellModel } from './shell/AppShell.js';
export { runInstallerMvp, runInstallerMvpUninstall } from './runtime/installer-mvp.js';
export {
  installWindowsInstallerMvp,
  uninstallWindowsInstallerMvp,
  resolveBuiltWindowsInstallerPayloadRoot,
  resolveDefaultWindowsInstallerInstallRoot,
  WINDOWS_INSTALLER_INSTALL_FOLDER,
  WINDOWS_INSTALLER_LAUNCHER_FILE,
  WINDOWS_INSTALLER_MANIFEST_FILE,
  WINDOWS_INSTALLER_PRODUCT_NAME,
} from './runtime/windows-install.js';
export type { BootstrapWindowsInstallerOptions } from './bootstrap.js';
export type {
  DiagnosticLevel,
  DiagnosticsEvent,
  DiagnosticsReport,
  EnvironmentCheckItem,
  EnvironmentCheckResult,
  InstallerNote,
  InstallerPhase,
  InstallerStep,
  InstallerStepId,
  PhaseOnePlan,
  ShellModel,
  ShellStatus,
  WindowsInstallerBootstrap,
} from './shared/types.js';
export type { PsCommandResult, PsCommandOptions, SpawnFn } from './powershell/ps-runner.js';
export type { OpenClawInstallResult, OpenClawInstallOptions } from './openclaw/openclaw-install.js';
export type { OpenClawVerifyResult, OpenClawVerifyOptions } from './openclaw/openclaw-verify.js';
export type {
  InstallerMvpDeps,
  InstallerMvpIo,
  InstallerMvpOptions,
  InstallerMvpRunResult,
  InstallerMvpStepState,
} from './runtime/installer-mvp.js';
export type {
  WindowsInstallerManifest,
  WindowsInstallerMvpInstallOptions,
  WindowsInstallerMvpInstallResult,
  WindowsInstallerMvpLogger,
  WindowsInstallerMvpUninstallResult,
} from './runtime/windows-install.js';
