import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { describe, expect, test } from 'vitest';

import { bootstrapWindowsInstaller, runInstallerMvp } from '../src/index';

async function createPayloadTree(root: string) {
  await mkdir(join(root, 'src', 'runtime'), { recursive: true });
  await writeFile(join(root, 'src', 'runtime', 'cli.js'), "console.log('payload cli');\n", 'utf8');
  await writeFile(join(root, 'src', 'runtime', 'helper.js'), "export const helper = true;\n", 'utf8');
  await writeFile(join(root, 'notes.txt'), 'payload notes\n', 'utf8');
}

function createFakeIo(responses: boolean[]) {
  const lines: string[] = [];
  const prompts: string[] = [];

  return {
    lines,
    prompts,
    io: {
      writeLine: (line: string) => {
        lines.push(line);
      },
      prompt: async (question: string) => {
        prompts.push(question);
        return responses.shift() ?? false;
      },
    },
  };
}

describe('runInstallerMvp', () => {
  test('runs the MVP flow to completion when confirmed and performs a real install', async () => {
    const workspace = await mkdtemp(join(tmpdir(), 'openclaw-win-mvp-'));
    const payloadRoot = join(workspace, 'payload');
    const installRoot = join(workspace, 'install');
    const bootstrap = bootstrapWindowsInstaller({ platform: 'win32' });
    const fake = createFakeIo([]);

    try {
      await createPayloadTree(payloadRoot);

      const result = await runInstallerMvp(fake.io, {
        bootstrap,
        autoConfirm: true,
        installOptions: {
          platform: 'win32',
          installRoot,
          payloadRoot,
          now: new Date('2024-01-02T03:04:05.000Z'),
        },
      });

      expect(result.success).toBe(true);
      expect(result.aborted).toBe(false);
      expect(result.installResult?.existingInstallationDetected).toBe(false);
      expect(result.installResult?.installedFiles).toEqual(
        expect.arrayContaining([
          'dist/notes.txt',
          'dist/src/runtime/cli.js',
          'dist/src/runtime/helper.js',
          'OpenClaw.WindowsInstallerMVP.cmd',
          'install-manifest.json',
        ]),
      );
      expect(fake.prompts).toEqual([]);
      expect(fake.lines.join('\n')).toContain('Installing real payload...');
      expect(fake.lines.join('\n')).toContain(`Installed OpenClaw Windows Installer MVP at ${installRoot}`);
      expect(await readFile(join(installRoot, 'install-manifest.json'), 'utf8')).toContain('OpenClaw Windows Installer MVP');
      expect(await readFile(join(installRoot, 'dist', 'src', 'runtime', 'cli.js'), 'utf8')).toContain('payload cli');
      expect(await readFile(join(installRoot, 'OpenClaw.WindowsInstallerMVP.cmd'), 'utf8')).toContain('node "%INSTALL_ROOT%dist\\src\\runtime\\cli.js" %*');
    } finally {
      await rm(workspace, { recursive: true, force: true });
    }
  });

  test('aborts before validation when the user declines', async () => {
    const bootstrap = bootstrapWindowsInstaller({ platform: 'win32' });
    const fake = createFakeIo([false]);

    const result = await runInstallerMvp(fake.io, { bootstrap });

    expect(result.success).toBe(false);
    expect(result.aborted).toBe(true);
    expect(result.abortedAt).toBe('validate');
    expect(result.steps[0].status).toBe('completed');
    expect(result.steps[1].status).toBe('skipped');
    expect(result.steps[2].status).toBe('pending');
    expect(fake.prompts).toEqual(['Continue to validation?']);
  });

  test('blocks on unsupported hosts without prompting', async () => {
    const bootstrap = bootstrapWindowsInstaller({ platform: 'linux' as NodeJS.Platform });
    const fake = createFakeIo([]);

    const result = await runInstallerMvp(fake.io, { bootstrap });

    expect(result.success).toBe(false);
    expect(result.aborted).toBe(true);
    expect(result.abortedAt).toBe('environment-check');
    expect(result.steps[0].status).toBe('skipped');
    expect(fake.prompts).toEqual([]);
    expect(fake.lines.join('\n')).toContain('Environment check failed: the installer MVP must run on Windows.');
  });
});
