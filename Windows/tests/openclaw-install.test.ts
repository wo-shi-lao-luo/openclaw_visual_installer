import { EventEmitter } from 'node:events';
import { describe, expect, test, vi } from 'vitest';
import type { SpawnFn } from '../src/powershell/ps-runner';
import {
  installOpenClaw,
  buildInstallCommand,
  OPENCLAW_INSTALL_SCRIPT_URL,
  NODE_DOWNLOAD_URL,
  NODE_VERSION,
} from '../src/openclaw/openclaw-install';

function createMockSpawn(exitCode: number, stdout: string, stderr = ''): SpawnFn {
  return vi.fn().mockImplementation(() => {
    const child = new EventEmitter() as ReturnType<SpawnFn>;
    (child as unknown as { stdout: EventEmitter; stderr: EventEmitter }).stdout = new EventEmitter();
    (child as unknown as { stderr: EventEmitter }).stderr = new EventEmitter();
    setImmediate(() => {
      if (stdout) (child as unknown as { stdout: EventEmitter }).stdout.emit('data', Buffer.from(stdout));
      if (stderr) (child as unknown as { stderr: EventEmitter }).stderr.emit('data', Buffer.from(stderr));
      child.emit('close', exitCode);
    });
    return child;
  });
}

describe('buildInstallCommand', () => {
  test('includes a Node.js check before the openclaw install', () => {
    const cmd = buildInstallCommand();
    expect(cmd).toContain('Get-Command node');
    expect(cmd).toContain(OPENCLAW_INSTALL_SCRIPT_URL);
    expect(cmd).toContain('-NoOnboard');
  });

  test('includes the winget fallback for Node.js', () => {
    const cmd = buildInstallCommand();
    expect(cmd).toContain('winget');
    expect(cmd).toContain('OpenJS.NodeJS.LTS');
    expect(cmd).toContain('--scope user');
  });

  test('includes the zip download fallback with correct URL and version', () => {
    const cmd = buildInstallCommand();
    expect(cmd).toContain(NODE_DOWNLOAD_URL);
    expect(cmd).toContain(NODE_VERSION);
    expect(cmd).toContain('Expand-Archive');
    expect(cmd).toContain('LOCALAPPDATA');
  });

  test('refreshes PATH within the session after zip install', () => {
    const cmd = buildInstallCommand();
    expect(cmd).toContain('$env:PATH');
    expect(cmd).toContain('SetEnvironmentVariable');
  });

  test('openclaw install runs after the Node.js setup block', () => {
    const cmd = buildInstallCommand();
    const nodeCheckIdx = cmd.indexOf('Get-Command node');
    const installIdx = cmd.indexOf(OPENCLAW_INSTALL_SCRIPT_URL);
    expect(nodeCheckIdx).toBeGreaterThanOrEqual(0);
    expect(installIdx).toBeGreaterThan(nodeCheckIdx);
  });
});

describe('installOpenClaw', () => {
  test('returns success=true when powershell exits 0', async () => {
    const spawn = createMockSpawn(0, '[OK] Node.js ready: v22.14.0\nInstalling openclaw...\nDone.\n');
    const result = await installOpenClaw({ spawnFn: spawn });

    expect(result.success).toBe(true);
    expect(result.exitCode).toBe(0);
    expect(result.message).toContain('successfully');
  });

  test('returns success=false when powershell exits non-zero', async () => {
    const spawn = createMockSpawn(1, '', 'Failed to install Node.js\n');
    const result = await installOpenClaw({ spawnFn: spawn });

    expect(result.success).toBe(false);
    expect(result.message).toContain('failed');
  });

  test('invokes powershell.exe with -NoProfile -NonInteractive -ExecutionPolicy Bypass', async () => {
    const spawn = createMockSpawn(0, '');
    await installOpenClaw({ spawnFn: spawn });

    expect(spawn).toHaveBeenCalledWith(
      'powershell.exe',
      expect.arrayContaining(['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass']),
      expect.anything(),
    );
  });

  test('forwards stdout lines via onOutputLine callback', async () => {
    const lines: string[] = [];
    const spawn = createMockSpawn(0, '[OK] Node.js ready: v22.14.0\nDownloading...\nDone.\n');

    await installOpenClaw({ spawnFn: spawn, onOutputLine: (l) => lines.push(l) });

    expect(lines).toContain('[OK] Node.js ready: v22.14.0');
    expect(lines).toContain('Downloading...');
  });
});
