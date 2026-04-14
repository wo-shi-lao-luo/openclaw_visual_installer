import { access, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, resolve } from 'node:path';

export const WINDOWS_INSTALLER_PRODUCT_NAME = 'OpenClaw Windows Installer MVP';
export const WINDOWS_INSTALLER_INSTALL_FOLDER = 'OpenClaw/WindowsInstallerMVP';
export const WINDOWS_INSTALLER_MANIFEST_FILE = 'install-manifest.json';
export const WINDOWS_INSTALLER_LAUNCHER_FILE = 'OpenClaw.WindowsInstallerMVP.cmd';

export interface WindowsInstallerManifest {
  productName: string;
  installedAt: string;
  installRoot: string;
  payloadRoot: string;
  launcherPath: string;
  manifestPath: string;
  platform: NodeJS.Platform;
  existingInstallationDetected: boolean;
  installedFiles: string[];
}

export interface WindowsInstallerMvpInstallOptions {
  installRoot?: string;
  payloadRoot?: string;
  platform?: NodeJS.Platform;
  now?: Date;
  logger?: WindowsInstallerMvpLogger;
}

export interface WindowsInstallerMvpLogger {
  writeLine(line: string): void;
}

export interface WindowsInstallerMvpInstallResult {
  productName: string;
  installRoot: string;
  payloadRoot: string;
  manifestPath: string;
  launcherPath: string;
  installedFiles: string[];
  existingInstallationDetected: boolean;
  previousManifest?: WindowsInstallerManifest;
}

export interface WindowsInstallerMvpUninstallResult {
  installRoot: string;
  removed: boolean;
}

function isWindowsPlatform(platform: NodeJS.Platform): boolean {
  return platform === 'win32';
}

export function resolveDefaultWindowsInstallerInstallRoot(): string {
  const localAppData = process.env.LOCALAPPDATA;

  if (localAppData && localAppData.trim().length > 0) {
    return resolve(localAppData, 'OpenClaw', 'WindowsInstallerMVP');
  }

  const userProfile = process.env.USERPROFILE;
  if (userProfile && userProfile.trim().length > 0) {
    return resolve(userProfile, 'AppData', 'Local', 'OpenClaw', 'WindowsInstallerMVP');
  }

  return resolve(process.cwd(), 'OpenClaw', 'WindowsInstallerMVP');
}

export function resolveBuiltWindowsInstallerPayloadRoot(): string {
  return resolve(__dirname, '..', '..', '..');
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function copyDirectoryTree(source: string, destination: string, relativePath = '', installedFiles: string[] = []): Promise<string[]> {
  await mkdir(destination, { recursive: true });

  const entries = await readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourceEntry = join(source, entry.name);
    const destinationEntry = join(destination, entry.name);
    const relativeEntry = relativePath ? join(relativePath, entry.name) : entry.name;

    if (entry.isDirectory()) {
      await copyDirectoryTree(sourceEntry, destinationEntry, relativeEntry, installedFiles);
      continue;
    }

    if (entry.isFile()) {
      const content = await readFile(sourceEntry);
      await writeFile(destinationEntry, content);
      installedFiles.push(relativeEntry.split('\\').join('/'));
    }
  }

  return installedFiles;
}

async function readManifest(manifestPath: string): Promise<WindowsInstallerManifest | undefined> {
  if (!(await pathExists(manifestPath))) {
    return undefined;
  }

  try {
    const raw = await readFile(manifestPath, 'utf8');
    return JSON.parse(raw) as WindowsInstallerManifest;
  } catch {
    return undefined;
  }
}

function buildLauncherContent(): string {
  const cliPath = join('dist', 'src', 'runtime', 'cli.js').split('/').join('\\');

  return [
    '@echo off',
    'setlocal',
    'set "INSTALL_ROOT=%~dp0"',
    `node "%INSTALL_ROOT%${cliPath}" %*`,
    'endlocal',
    '',
  ].join('\r\n');
}

export async function installWindowsInstallerMvp(options: WindowsInstallerMvpInstallOptions = {}): Promise<WindowsInstallerMvpInstallResult> {
  const platform = options.platform ?? process.platform;
  const logger = options.logger;

  if (!isWindowsPlatform(platform)) {
    throw new Error('Windows installer MVP can only install on a Windows host.');
  }

  const installRoot = options.installRoot ? resolve(options.installRoot) : resolveDefaultWindowsInstallerInstallRoot();
  const payloadRoot = options.payloadRoot ? resolve(options.payloadRoot) : resolveBuiltWindowsInstallerPayloadRoot();
  const manifestPath = join(installRoot, WINDOWS_INSTALLER_MANIFEST_FILE);
  const payloadInstallRoot = join(installRoot, 'dist');
  const launcherPath = join(installRoot, WINDOWS_INSTALLER_LAUNCHER_FILE);
  const now = options.now ?? new Date();

  logger?.writeLine(`Install root: ${installRoot}`);
  logger?.writeLine(`Payload root: ${payloadRoot}`);

  const previousManifest = await readManifest(manifestPath);
  const existingInstallationDetected = Boolean(previousManifest) || (await pathExists(payloadInstallRoot)) || (await pathExists(launcherPath));

  if (existingInstallationDetected) {
    logger?.writeLine('Existing installation detected. The payload will be refreshed in place.');
  } else {
    logger?.writeLine('No prior installation detected. A fresh install will be created.');
  }

  await mkdir(installRoot, { recursive: true });

  if (await pathExists(payloadInstallRoot)) {
    await rm(payloadInstallRoot, { recursive: true, force: true });
  }

  logger?.writeLine('Copying runnable payload into dist/.');
  const installedFiles = await copyDirectoryTree(payloadRoot, payloadInstallRoot, 'dist');

  logger?.writeLine(`Writing launcher: ${launcherPath}`);
  await writeFile(launcherPath, buildLauncherContent(), 'utf8');

  const allInstalledFiles = [...installedFiles, WINDOWS_INSTALLER_LAUNCHER_FILE, WINDOWS_INSTALLER_MANIFEST_FILE];

  const manifest: WindowsInstallerManifest = {
    productName: WINDOWS_INSTALLER_PRODUCT_NAME,
    installedAt: now.toISOString(),
    installRoot,
    payloadRoot,
    launcherPath,
    manifestPath,
    platform,
    existingInstallationDetected,
    installedFiles: allInstalledFiles,
  };

  logger?.writeLine(`Writing manifest: ${manifestPath}`);
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  return {
    productName: WINDOWS_INSTALLER_PRODUCT_NAME,
    installRoot,
    payloadRoot,
    manifestPath,
    launcherPath,
    installedFiles: allInstalledFiles,
    existingInstallationDetected,
    previousManifest,
  };
}

export async function uninstallWindowsInstallerMvp(options: Pick<WindowsInstallerMvpInstallOptions, 'installRoot' | 'platform' | 'logger'> = {}): Promise<WindowsInstallerMvpUninstallResult> {
  const platform = options.platform ?? process.platform;

  if (!isWindowsPlatform(platform)) {
    throw new Error('Windows installer MVP can only uninstall on a Windows host.');
  }

  const installRoot = options.installRoot ? resolve(options.installRoot) : resolveDefaultWindowsInstallerInstallRoot();
  const exists = await pathExists(installRoot);

  if (!exists) {
    options.logger?.writeLine(`No installation found at ${installRoot}. Nothing to remove.`);
    return { installRoot, removed: false };
  }

  options.logger?.writeLine(`Removing installation tree: ${installRoot}`);
  await rm(installRoot, { recursive: true, force: true });
  return { installRoot, removed: true };
}
