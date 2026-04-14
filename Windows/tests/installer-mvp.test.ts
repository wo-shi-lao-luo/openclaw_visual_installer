import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { describe, expect, test, vi } from 'vitest';

import { bootstrapWindowsInstaller, runInstallerMvp } from '../src/index';
import type { InstallerMvpDeps } from '../src/index';
import type { OpenClawInstallResult } from '../src/openclaw/openclaw-install';
import type { OpenClawVerifyResult } from '../src/openclaw/openclaw-verify';

async function createPayloadTree(root: string) {
  await mkdir(join(root, 'src', 'runtime'), { recursive: true });
  await writeFile(join(root, 'src', 'runtime', 'cli.js'), "console.log('payload cli');\n", 'utf8');
}

function createFakeIo(responses: boolean[]) {
  const lines: string[] = [];
  const prompts: string[] = [];
  return {
    lines,
    prompts,
    io: {
      writeLine: (line: string) => { lines.push(line); },
      prompt: async (question: string) => { prompts.push(question); return responses.shift() ?? false; },
    },
  };
}

function createSuccessDeps(overrides: Partial<InstallerMvpDeps> = {}): InstallerMvpDeps {
  const installOk: OpenClawInstallResult = {
    success: true, exitCode: 0,
    stdout: 'Installing openclaw...\nDone.\n', stderr: '',
    message: 'OpenClaw installed successfully.',
  };
  const verifyOk: OpenClawVerifyResult = {
    cliFound: true,
    cliPath: 'C:\\Users\\user\\.local\\bin\\openclaw.cmd',
    gatewayReachable: true,
    gatewayOutput: 'gateway running',
    message: 'OpenClaw CLI found at C:\\Users\\user\\.local\\bin\\openclaw.cmd. Gateway is reachable on port 18789.',
  };
  return {
    installOpenClaw: async () => installOk,
    verifyOpenClaw: async () => verifyOk,
    ...overrides,
  };
}

describe('runInstallerMvp', () => {
  test('runs the full Phase 2 flow to completion', async () => {
    const workspace = await mkdtemp(join(tmpdir(), 'openclaw-win-mvp-'));
    const payloadRoot = join(workspace, 'payload');
    const installRoot = join(workspace, 'install');
    const bootstrap = bootstrapWindowsInstaller({ platform: 'win32' });
    const fake = createFakeIo([]);

    try {
      await createPayloadTree(payloadRoot);

      const result = await runInstallerMvp(
        fake.io,
        { bootstrap, autoConfirm: true, installOptions: { platform: 'win32', installRoot, payloadRoot } },
        createSuccessDeps(),
      );

      expect(result.success).toBe(true);
      expect(result.aborted).toBe(false);
      expect(result.openClawInstallResult?.success).toBe(true);
      expect(result.openClawVerifyResult?.cliFound).toBe(true);
      expect(result.installResult?.installRoot).toBe(installRoot);
      expect(fake.lines.join('\n')).toContain('OpenClaw is installed and ready.');
      expect(await readFile(join(installRoot, 'install-manifest.json'), 'utf8')).toContain('OpenClaw Windows Installer MVP');
    } finally {
      await rm(workspace, { recursive: true, force: true });
    }
  });

  test('streams install output lines with indentation', async () => {
    const workspace = await mkdtemp(join(tmpdir(), 'openclaw-output-'));
    const payloadRoot = join(workspace, 'payload');
    const installRoot = join(workspace, 'install');
    const fake = createFakeIo([]);

    try {
      await createPayloadTree(payloadRoot);
      const bootstrap = bootstrapWindowsInstaller({ platform: 'win32' });

      await runInstallerMvp(
        fake.io,
        { bootstrap, autoConfirm: true, installOptions: { platform: 'win32', installRoot, payloadRoot } },
        createSuccessDeps({
          installOpenClaw: async ({ onOutputLine } = {}) => {
            onOutputLine?.('Downloading archive...');
            onOutputLine?.('Extracting...');
            return { success: true, exitCode: 0, stdout: '', stderr: '', message: 'OpenClaw installed successfully.' };
          },
        }),
      );

      expect(fake.lines).toContain('  Downloading archive...');
      expect(fake.lines).toContain('  Extracting...');
    } finally {
      await rm(workspace, { recursive: true, force: true });
    }
  });

  test('aborts at validate when user declines', async () => {
    const bootstrap = bootstrapWindowsInstaller({ platform: 'win32' });
    const fake = createFakeIo([false]);

    const result = await runInstallerMvp(fake.io, { bootstrap }, createSuccessDeps());

    expect(result.success).toBe(false);
    expect(result.aborted).toBe(true);
    expect(result.abortedAt).toBe('validate');
    expect(fake.prompts).toEqual(['Install OpenClaw on this machine?']);
  });

  test('returns failure when the install script fails', async () => {
    const bootstrap = bootstrapWindowsInstaller({ platform: 'win32' });
    const fake = createFakeIo([]);

    const result = await runInstallerMvp(
      fake.io,
      { bootstrap, autoConfirm: true },
      createSuccessDeps({
        installOpenClaw: async () => ({
          success: false, exitCode: 1,
          stdout: '', stderr: 'Network error',
          message: 'OpenClaw installation failed (exit code 1).',
        }),
      }),
    );

    expect(result.success).toBe(false);
    expect(result.aborted).toBe(false);
    expect(result.openClawInstallResult?.success).toBe(false);
    expect(fake.lines.join('\n')).toContain('OpenClaw installation failed');
  });

  test('returns failure when CLI verification fails', async () => {
    const workspace = await mkdtemp(join(tmpdir(), 'openclaw-verify-fail-'));
    const payloadRoot = join(workspace, 'payload');
    const installRoot = join(workspace, 'install');
    const bootstrap = bootstrapWindowsInstaller({ platform: 'win32' });
    const fake = createFakeIo([]);

    try {
      await createPayloadTree(payloadRoot);

      const result = await runInstallerMvp(
        fake.io,
        { bootstrap, autoConfirm: true, installOptions: { platform: 'win32', installRoot, payloadRoot } },
        createSuccessDeps({
          verifyOpenClaw: async () => ({
            cliFound: false,
            message: 'OpenClaw CLI not found on PATH.',
          }),
        }),
      );

      expect(result.success).toBe(false);
      expect(result.openClawVerifyResult?.cliFound).toBe(false);
      expect(fake.lines.join('\n')).toContain('Verification failed');
      expect(fake.lines.join('\n')).toContain('new PowerShell window');
    } finally {
      await rm(workspace, { recursive: true, force: true });
    }
  });

  test('blocks on non-Windows hosts without running any install steps', async () => {
    const bootstrap = bootstrapWindowsInstaller({ platform: 'linux' as NodeJS.Platform });
    const fake = createFakeIo([]);
    const installOpenClaw = vi.fn();

    const result = await runInstallerMvp(fake.io, { bootstrap }, { installOpenClaw });

    expect(result.success).toBe(false);
    expect(result.aborted).toBe(true);
    expect(result.abortedAt).toBe('environment-check');
    expect(installOpenClaw).not.toHaveBeenCalled();
  });

  test('all steps are completed on a successful full run', async () => {
    const workspace = await mkdtemp(join(tmpdir(), 'openclaw-steps-'));
    const payloadRoot = join(workspace, 'payload');
    const installRoot = join(workspace, 'install');
    const bootstrap = bootstrapWindowsInstaller({ platform: 'win32' });
    const fake = createFakeIo([]);

    try {
      await createPayloadTree(payloadRoot);

      const result = await runInstallerMvp(
        fake.io,
        { bootstrap, autoConfirm: true, installOptions: { platform: 'win32', installRoot, payloadRoot } },
        createSuccessDeps(),
      );

      const stepById = Object.fromEntries(result.steps.map((s) => [s.id, s.status]));
      expect(stepById['environment-check']).toBe('completed');
      expect(stepById['validate']).toBe('completed');
      expect(stepById['install']).toBe('completed');
      expect(stepById['verify']).toBe('completed');
      expect(stepById['finalize']).toBe('completed');
    } finally {
      await rm(workspace, { recursive: true, force: true });
    }
  });
});
