import { bootstrapWindowsInstaller, type BootstrapWindowsInstallerOptions } from '../bootstrap.js';
import { installWindowsInstallerMvp, uninstallWindowsInstallerMvp, type WindowsInstallerMvpInstallOptions, type WindowsInstallerMvpLogger, type WindowsInstallerMvpUninstallResult } from './windows-install.js';
import type { InstallerStepId, WindowsInstallerBootstrap } from '../shared/types.js';

export type InstallerMvpStepStatus = 'pending' | 'running' | 'completed' | 'skipped';

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

export interface InstallerMvpRunResult {
  success: boolean;
  aborted: boolean;
  abortedAt?: InstallerStepId | 'environment-check' | 'uninstall';
  bootstrap: WindowsInstallerBootstrap;
  steps: InstallerMvpStepState[];
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

function setStepStatus(steps: InstallerMvpStepState[], id: InstallerStepId, status: InstallerMvpStepStatus, detail?: string) {
  const step = steps.find((candidate) => candidate.id === id);

  if (!step) {
    return;
  }

  step.status = status;
  step.detail = detail;
}

async function confirmStep(io: InstallerMvpIo, question: string, autoConfirm: boolean): Promise<boolean> {
  if (autoConfirm) {
    return true;
  }

  return io.prompt(question);
}

function printBootstrap(io: InstallerMvpIo, bootstrap: WindowsInstallerBootstrap) {
  io.writeLine('OpenClaw Windows Installer MVP');
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
  return {
    writeLine: (line: string) => io.writeLine(line),
  };
}

export async function runInstallerMvp(io: InstallerMvpIo, options: InstallerMvpOptions = {}): Promise<InstallerMvpRunResult> {
  const bootstrap = options.bootstrap ?? bootstrapWindowsInstaller(options.bootstrapOptions);
  const steps = createStepStates(bootstrap);
  const autoConfirm = options.autoConfirm ?? false;

  printBootstrap(io, bootstrap);

  if (!bootstrap.environment.supported) {
    setStepStatus(steps, 'environment-check', 'skipped', 'Unsupported host platform');
    io.writeLine('Environment check failed: the installer MVP must run on Windows.');
    io.writeLine('Nothing was installed.');

    return {
      success: false,
      aborted: true,
      abortedAt: 'environment-check',
      bootstrap,
      steps,
    };
  }

  setStepStatus(steps, 'environment-check', 'completed', 'Windows host supported');
  io.writeLine('Environment check passed.');

  if (!(await confirmStep(io, 'Continue to validation?', autoConfirm))) {
    setStepStatus(steps, 'validate', 'skipped', 'User stopped before validation');
    io.writeLine('Installer stopped before validation.');

    return {
      success: false,
      aborted: true,
      abortedAt: 'validate',
      bootstrap,
      steps,
    };
  }

  setStepStatus(steps, 'validate', 'completed', 'Validation placeholders completed');
  io.writeLine('Validation complete.');

  const installTarget = options.installOptions?.installRoot ?? 'the default user-local install directory';
  if (!(await confirmStep(io, `Install OpenClaw Windows Installer MVP into ${installTarget}?`, autoConfirm))) {
    setStepStatus(steps, 'install', 'skipped', 'User stopped before install');
    io.writeLine('Installer stopped before install.');

    return {
      success: false,
      aborted: true,
      abortedAt: 'install',
      bootstrap,
      steps,
    };
  }

  setStepStatus(steps, 'install', 'running', 'Copying runnable payload into the local install directory');
  io.writeLine('Installing real payload...');
  const installResult = await installWindowsInstallerMvp({
    ...options.installOptions,
    logger: createLogger(io),
    platform: bootstrap.environment.platform === 'windows' ? 'win32' : (options.installOptions?.platform ?? process.platform),
  });
  setStepStatus(steps, 'install', 'completed', installResult.existingInstallationDetected ? 'Refreshed an existing installation' : 'Fresh installation created');

  setStepStatus(steps, 'finalize', 'completed', 'Installer MVP finished');
  io.writeLine('Finalizing setup...');
  io.writeLine(`Installed ${installResult.productName} at ${installResult.installRoot}`);
  io.writeLine(`Launcher: ${installResult.launcherPath}`);
  io.writeLine(`Manifest: ${installResult.manifestPath}`);
  io.writeLine('Setup complete. The Windows installer MVP now performs a real local install.');

  return {
    success: true,
    aborted: false,
    bootstrap,
    steps,
    installResult,
  };
}

export async function runInstallerMvpUninstall(io: InstallerMvpIo, options: InstallerMvpOptions = {}): Promise<InstallerMvpRunResult> {
  const bootstrap = options.bootstrap ?? bootstrapWindowsInstaller(options.bootstrapOptions);
  const steps = createStepStates(bootstrap);

  printBootstrap(io, bootstrap);

  if (!bootstrap.environment.supported) {
    setStepStatus(steps, 'environment-check', 'skipped', 'Unsupported host platform');
    io.writeLine('Environment check failed: the installer MVP must run on Windows.');
    io.writeLine('Nothing was removed.');

    return {
      success: false,
      aborted: true,
      abortedAt: 'environment-check',
      bootstrap,
      steps,
    };
  }

  setStepStatus(steps, 'environment-check', 'completed', 'Windows host supported');
  io.writeLine('Environment check passed.');

  if (!(await confirmStep(io, 'Remove the local Windows installer MVP installation?', options.autoConfirm ?? false))) {
    setStepStatus(steps, 'install', 'skipped', 'User stopped before uninstall');
    io.writeLine('Installer stopped before uninstall.');

    return {
      success: false,
      aborted: true,
      abortedAt: 'uninstall',
      bootstrap,
      steps,
    };
  }

  setStepStatus(steps, 'install', 'running', 'Removing local installation tree');
  const uninstallResult = await uninstallWindowsInstallerMvp({
    ...options.installOptions,
    logger: createLogger(io),
    platform: bootstrap.environment.platform === 'windows' ? 'win32' : (options.installOptions?.platform ?? process.platform),
  });
  setStepStatus(steps, 'install', 'completed', uninstallResult.removed ? 'Installation tree removed' : 'Nothing to remove');
  setStepStatus(steps, 'finalize', 'completed', 'Uninstall flow finished');

  io.writeLine(`Uninstall complete. Removed: ${uninstallResult.removed ? 'yes' : 'no'}`);

  return {
    success: true,
    aborted: false,
    bootstrap,
    steps,
    uninstallResult,
  };
}
