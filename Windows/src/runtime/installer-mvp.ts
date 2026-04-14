import { bootstrapWindowsInstaller, type BootstrapWindowsInstallerOptions } from '../bootstrap.js';
import { installOpenClaw, type OpenClawInstallResult, type OpenClawInstallOptions } from '../openclaw/openclaw-install.js';
import { verifyOpenClaw, type OpenClawVerifyResult, type OpenClawVerifyOptions } from '../openclaw/openclaw-verify.js';
import {
  installWindowsInstallerMvp,
  uninstallWindowsInstallerMvp,
  type WindowsInstallerMvpInstallOptions,
  type WindowsInstallerMvpLogger,
  type WindowsInstallerMvpUninstallResult,
} from './windows-install.js';
import type { InstallerStepId, WindowsInstallerBootstrap } from '../shared/types.js';

export type InstallerMvpStepStatus = 'pending' | 'running' | 'completed' | 'skipped' | 'failed';

export interface InstallerMvpStepState {
  id: InstallerStepId;
  label: string;
  status: InstallerMvpStepStatus;
  detail?: string;
}

export interface InstallerMvpIo {
  writeLine(line: string): void;
  prompt(question: string): Promise<boolean>;
}

export interface InstallerMvpOptions {
  bootstrap?: WindowsInstallerBootstrap;
  bootstrapOptions?: BootstrapWindowsInstallerOptions;
  autoConfirm?: boolean;
  installOptions?: WindowsInstallerMvpInstallOptions;
}

export interface InstallerMvpDeps {
  installOpenClaw?: (options?: OpenClawInstallOptions) => Promise<OpenClawInstallResult>;
  verifyOpenClaw?: (options?: OpenClawVerifyOptions) => Promise<OpenClawVerifyResult>;
}

export interface InstallerMvpRunResult {
  success: boolean;
  aborted: boolean;
  abortedAt?: InstallerStepId | 'environment-check' | 'uninstall';
  bootstrap: WindowsInstallerBootstrap;
  steps: InstallerMvpStepState[];
  openClawInstallResult?: OpenClawInstallResult;
  openClawVerifyResult?: OpenClawVerifyResult;
  installResult?: Awaited<ReturnType<typeof installWindowsInstallerMvp>>;
  uninstallResult?: WindowsInstallerMvpUninstallResult;
}

function createStepStates(bootstrap: WindowsInstallerBootstrap): InstallerMvpStepState[] {
  return bootstrap.plan.steps.map((step) => ({
    id: step.id,
    label: step.label,
    status: 'pending' as const,
  }));
}

function setStepStatus(
  steps: InstallerMvpStepState[],
  id: InstallerStepId,
  status: InstallerMvpStepStatus,
  detail?: string,
): void {
  const step = steps.find((candidate) => candidate.id === id);
  if (step) {
    step.status = status;
    step.detail = detail;
  }
}

async function confirmStep(io: InstallerMvpIo, question: string, autoConfirm: boolean): Promise<boolean> {
  if (autoConfirm) return true;
  return io.prompt(question);
}

function printBootstrap(io: InstallerMvpIo, bootstrap: WindowsInstallerBootstrap): void {
  io.writeLine('OpenClaw Windows Installer');
  io.writeLine(`Title: ${bootstrap.shell.title}`);
  io.writeLine(`Phase: ${bootstrap.shell.phase}`);
  io.writeLine(`Status: ${bootstrap.shell.status}`);
  io.writeLine(`Environment supported: ${bootstrap.environment.supported ? 'yes' : 'no'}`);
  io.writeLine('Planned steps:');
  for (const step of bootstrap.plan.steps) {
    io.writeLine(`- ${step.label} (${step.id})`);
  }
}

function createLogger(io: InstallerMvpIo): WindowsInstallerMvpLogger {
  return { writeLine: (line: string) => io.writeLine(line) };
}

export async function runInstallerMvp(
  io: InstallerMvpIo,
  options: InstallerMvpOptions = {},
  deps: InstallerMvpDeps = {},
): Promise<InstallerMvpRunResult> {
  const bootstrap = options.bootstrap ?? bootstrapWindowsInstaller(options.bootstrapOptions);
  const steps = createStepStates(bootstrap);
  const autoConfirm = options.autoConfirm ?? false;

  const installOpenClawFn = deps.installOpenClaw ?? installOpenClaw;
  const verifyOpenClawFn = deps.verifyOpenClaw ?? verifyOpenClaw;

  printBootstrap(io, bootstrap);

  // ── Step 1: Environment check ─────────────────────────────────────────────
  if (!bootstrap.environment.supported) {
    setStepStatus(steps, 'environment-check', 'skipped', 'Unsupported host platform');
    io.writeLine('Environment check failed: this installer must run on Windows.');
    io.writeLine('Nothing was installed.');
    return { success: false, aborted: true, abortedAt: 'environment-check', bootstrap, steps };
  }

  setStepStatus(steps, 'environment-check', 'completed', 'Windows host confirmed');
  io.writeLine('Environment check passed.');

  // ── Step 2: Validate ──────────────────────────────────────────────────────
  if (!(await confirmStep(io, 'Install OpenClaw on this machine?', autoConfirm))) {
    setStepStatus(steps, 'validate', 'skipped', 'User cancelled');
    io.writeLine('Installation cancelled.');
    return { success: false, aborted: true, abortedAt: 'validate', bootstrap, steps };
  }

  setStepStatus(steps, 'validate', 'completed', 'User confirmed install');

  // ── Step 3: Install OpenClaw ──────────────────────────────────────────────
  setStepStatus(steps, 'install', 'running', 'Running OpenClaw install script');
  io.writeLine('Installing OpenClaw...');
  io.writeLine('(This may take a few minutes.)');
  io.writeLine('');

  const openClawInstallResult = await installOpenClawFn({
    onOutputLine: (line: string) => io.writeLine(`  ${line}`),
  });

  io.writeLine('');

  if (!openClawInstallResult.success) {
    setStepStatus(steps, 'install', 'failed', openClawInstallResult.message);
    io.writeLine(`OpenClaw installation failed: ${openClawInstallResult.message}`);
    return { success: false, aborted: false, bootstrap, steps, openClawInstallResult };
  }

  setStepStatus(steps, 'install', 'completed', openClawInstallResult.message);
  io.writeLine('Install script completed.');

  // ── Step 4: Verify ────────────────────────────────────────────────────────
  setStepStatus(steps, 'verify', 'running', 'Verifying OpenClaw CLI on PATH');
  io.writeLine('Verifying installation...');

  const openClawVerifyResult = await verifyOpenClawFn();

  if (!openClawVerifyResult.cliFound) {
    setStepStatus(steps, 'verify', 'failed', openClawVerifyResult.message);
    io.writeLine(`Verification failed: ${openClawVerifyResult.message}`);
    io.writeLine('Try opening a new PowerShell window and running: openclaw --version');
    return { success: false, aborted: false, bootstrap, steps, openClawInstallResult, openClawVerifyResult };
  }

  setStepStatus(steps, 'verify', 'completed', openClawVerifyResult.message);
  io.writeLine(`Verification passed. ${openClawVerifyResult.message}`);

  // ── Step 5: Finalize ──────────────────────────────────────────────────────
  setStepStatus(steps, 'finalize', 'running', 'Writing manifest and launcher');
  io.writeLine('Finalizing setup...');

  const installResult = await installWindowsInstallerMvp({
    ...options.installOptions,
    logger: createLogger(io),
    platform: bootstrap.environment.platform === 'windows'
      ? 'win32'
      : (options.installOptions?.platform ?? process.platform),
  });

  setStepStatus(steps, 'finalize', 'completed', 'Setup complete');
  io.writeLine('');
  io.writeLine('OpenClaw is installed and ready.');
  io.writeLine(`CLI path: ${openClawVerifyResult.cliPath}`);
  if (openClawVerifyResult.gatewayReachable) {
    io.writeLine('Gateway: running');
  }
  io.writeLine('');
  io.writeLine('Open a new PowerShell window and run: openclaw --version');

  return {
    success: true,
    aborted: false,
    bootstrap,
    steps,
    openClawInstallResult,
    openClawVerifyResult,
    installResult,
  };
}

export async function runInstallerMvpUninstall(
  io: InstallerMvpIo,
  options: InstallerMvpOptions = {},
): Promise<InstallerMvpRunResult> {
  const bootstrap = options.bootstrap ?? bootstrapWindowsInstaller(options.bootstrapOptions);
  const steps = createStepStates(bootstrap);

  printBootstrap(io, bootstrap);

  if (!bootstrap.environment.supported) {
    setStepStatus(steps, 'environment-check', 'skipped', 'Unsupported host platform');
    io.writeLine('Environment check failed: this installer must run on Windows.');
    io.writeLine('Nothing was removed.');
    return { success: false, aborted: true, abortedAt: 'environment-check', bootstrap, steps };
  }

  setStepStatus(steps, 'environment-check', 'completed', 'Windows host confirmed');
  io.writeLine('Environment check passed.');

  if (!(await confirmStep(io, 'Remove the local installer record?', options.autoConfirm ?? false))) {
    setStepStatus(steps, 'install', 'skipped', 'User cancelled');
    io.writeLine('Uninstall cancelled.');
    return { success: false, aborted: true, abortedAt: 'uninstall', bootstrap, steps };
  }

  setStepStatus(steps, 'install', 'running', 'Removing local installation record');
  const uninstallResult = await uninstallWindowsInstallerMvp({
    ...options.installOptions,
    logger: createLogger(io),
    platform: bootstrap.environment.platform === 'windows'
      ? 'win32'
      : (options.installOptions?.platform ?? process.platform),
  });
  setStepStatus(steps, 'install', 'completed', uninstallResult.removed ? 'Record removed' : 'Nothing to remove');
  setStepStatus(steps, 'finalize', 'completed', 'Uninstall finished');

  io.writeLine(`Uninstall complete. Removed: ${uninstallResult.removed ? 'yes' : 'no'}`);
  io.writeLine('Note: the OpenClaw CLI itself was not uninstalled. Run `openclaw uninstall` to remove it.');

  return { success: true, aborted: false, bootstrap, steps, uninstallResult };
}
