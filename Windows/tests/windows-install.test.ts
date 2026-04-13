import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { describe, expect, test } from 'vitest';

import {
  installWindowsInstallerMvp,
  uninstallWindowsInstallerMvp,
  WINDOWS_INSTALLER_LAUNCHER_FILE,
  WINDOWS_INSTALLER_MANIFEST_FILE,
  WINDOWS_INSTALLER_PRODUCT_NAME,
} from '../src/index';

async function createPayloadTree(root: string, marker: string) {
  await mkdir(join(root, 'src', 'runtime'), { recursive: true });
  await writeFile(join(root, 'src', 'runtime', 'cli.js'), `console.log('${marker}');\n`, 'utf8');
  await writeFile(join(root, 'src', 'runtime', 'extra.js'), `export const marker = '${marker}';\n`, 'utf8');
  await writeFile(join(root, 'assets.txt'), `${marker}\n`, 'utf8');
}

describe('Windows installer filesystem pipeline', () => {
  test('installs payload files, launcher, and manifest into a real directory', async () => {
    const workspace = await mkdtemp(join(tmpdir(), 'openclaw-win-install-'));
    const payloadRoot = join(workspace, 'payload');
    const installRoot = join(workspace, 'install');
    const logs: string[] = [];

    try {
      await createPayloadTree(payloadRoot, 'first payload');

      const result = await installWindowsInstallerMvp({
        platform: 'win32',
        installRoot,
        payloadRoot,
        now: new Date('2024-04-05T06:07:08.000Z'),
        logger: {
          writeLine: (line: string) => logs.push(line),
        },
      });

      expect(result.productName).toBe(WINDOWS_INSTALLER_PRODUCT_NAME);
      expect(result.existingInstallationDetected).toBe(false);
      expect(result.installedFiles).toEqual(
        expect.arrayContaining([
          'dist/assets.txt',
          'dist/src/runtime/cli.js',
          'dist/src/runtime/extra.js',
          WINDOWS_INSTALLER_LAUNCHER_FILE,
          WINDOWS_INSTALLER_MANIFEST_FILE,
        ]),
      );
      expect(logs.join('\n')).toContain('No prior installation detected. A fresh install will be created.');
      expect(await readFile(join(installRoot, 'dist', 'src', 'runtime', 'cli.js'), 'utf8')).toContain('first payload');
      expect(await readFile(join(installRoot, WINDOWS_INSTALLER_LAUNCHER_FILE), 'utf8')).toContain('node "%INSTALL_ROOT%dist\\src\\runtime\\cli.js" %*');

      const manifest = JSON.parse(await readFile(join(installRoot, WINDOWS_INSTALLER_MANIFEST_FILE), 'utf8')) as {
        productName: string;
        installedFiles: string[];
        existingInstallationDetected: boolean;
      };

      expect(manifest.productName).toBe(WINDOWS_INSTALLER_PRODUCT_NAME);
      expect(manifest.existingInstallationDetected).toBe(false);
      expect(manifest.installedFiles).toEqual(result.installedFiles);
    } finally {
      await rm(workspace, { recursive: true, force: true });
    }
  });

  test('detects an existing installation and refreshes it cleanly', async () => {
    const workspace = await mkdtemp(join(tmpdir(), 'openclaw-win-install-existing-'));
    const payloadRootOne = join(workspace, 'payload-one');
    const payloadRootTwo = join(workspace, 'payload-two');
    const installRoot = join(workspace, 'install');

    try {
      await createPayloadTree(payloadRootOne, 'payload one');
      await createPayloadTree(payloadRootTwo, 'payload two');

      const first = await installWindowsInstallerMvp({
        platform: 'win32',
        installRoot,
        payloadRoot: payloadRootOne,
        now: new Date('2024-01-01T00:00:00.000Z'),
      });
      expect(first.existingInstallationDetected).toBe(false);

      const second = await installWindowsInstallerMvp({
        platform: 'win32',
        installRoot,
        payloadRoot: payloadRootTwo,
        now: new Date('2024-01-02T00:00:00.000Z'),
      });

      expect(second.existingInstallationDetected).toBe(true);
      expect(second.previousManifest?.productName).toBe(WINDOWS_INSTALLER_PRODUCT_NAME);
      expect(await readFile(join(installRoot, 'dist', 'src', 'runtime', 'cli.js'), 'utf8')).toContain('payload two');
    } finally {
      await rm(workspace, { recursive: true, force: true });
    }
  });

  test('uninstalls the installation tree when asked', async () => {
    const workspace = await mkdtemp(join(tmpdir(), 'openclaw-win-uninstall-'));
    const payloadRoot = join(workspace, 'payload');
    const installRoot = join(workspace, 'install');

    try {
      await createPayloadTree(payloadRoot, 'payload uninstall');
      await installWindowsInstallerMvp({
        platform: 'win32',
        installRoot,
        payloadRoot,
      });

      const uninstall = await uninstallWindowsInstallerMvp({
        platform: 'win32',
        installRoot,
      });

      expect(uninstall.removed).toBe(true);
      await expect(readFile(join(installRoot, WINDOWS_INSTALLER_MANIFEST_FILE), 'utf8')).rejects.toThrow();
    } finally {
      await rm(workspace, { recursive: true, force: true });
    }
  });
});
