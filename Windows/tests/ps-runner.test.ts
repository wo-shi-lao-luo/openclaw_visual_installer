import { EventEmitter } from 'node:events';
import { describe, expect, test, vi } from 'vitest';
import type { SpawnFn } from '../src/powershell/ps-runner';
import { runPowerShellCommand, runProcess } from '../src/powershell/ps-runner';

function createMockSpawn(exitCode: number, stdout: string, stderr = ''): SpawnFn {
  return vi.fn().mockImplementation(() => {
    const child = new EventEmitter() as ReturnType<SpawnFn>;
    (child as unknown as { stdout: EventEmitter; stderr: EventEmitter; kill: () => void }).stdout = new EventEmitter();
    (child as unknown as { stderr: EventEmitter }).stderr = new EventEmitter();
    (child as unknown as { kill: () => void }).kill = () => {};
    setImmediate(() => {
      if (stdout) (child as unknown as { stdout: EventEmitter }).stdout.emit('data', Buffer.from(stdout));
      if (stderr) (child as unknown as { stderr: EventEmitter }).stderr.emit('data', Buffer.from(stderr));
      child.emit('close', exitCode);
    });
    return child;
  });
}

describe('runPowerShellCommand', () => {
  test('resolves success=true when powershell exits 0', async () => {
    const spawn = createMockSpawn(0, 'output text\n');
    const result = await runPowerShellCommand('Get-Date', { spawnFn: spawn });

    expect(result.success).toBe(true);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe('output text\n');
  });

  test('resolves success=false when powershell exits non-zero', async () => {
    const spawn = createMockSpawn(1, '', 'error text\n');
    const result = await runPowerShellCommand('exit 1', { spawnFn: spawn });

    expect(result.success).toBe(false);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toBe('error text\n');
  });

  test('spawns powershell.exe with -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command', async () => {
    const spawn = createMockSpawn(0, '');
    await runPowerShellCommand('Get-Date', { spawnFn: spawn });

    expect(spawn).toHaveBeenCalledWith(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', 'Get-Date'],
      expect.objectContaining({ windowsHide: true }),
    );
  });

  test('streams stdout lines via onStdoutLine callback', async () => {
    const lines: string[] = [];
    const spawn = createMockSpawn(0, 'line one\nline two\n');

    await runPowerShellCommand('echo test', { spawnFn: spawn, onStdoutLine: (l) => lines.push(l) });

    expect(lines).toEqual(['line one', 'line two']);
  });

  test('rejects when spawn emits an error event', async () => {
    const spawnFn: SpawnFn = vi.fn().mockImplementation(() => {
      const child = new EventEmitter() as ReturnType<SpawnFn>;
      (child as unknown as { stdout: EventEmitter; stderr: EventEmitter }).stdout = new EventEmitter();
      (child as unknown as { stderr: EventEmitter }).stderr = new EventEmitter();
      setImmediate(() => child.emit('error', new Error('spawn ENOENT')));
      return child;
    });

    await expect(runPowerShellCommand('Get-Date', { spawnFn })).rejects.toThrow('spawn ENOENT');
  });
});

describe('runProcess', () => {
  test('spawns the given executable with args', async () => {
    const spawn = createMockSpawn(0, 'C:\\Windows\\openclaw.exe\n');
    const result = await runProcess('where.exe', ['openclaw'], { spawnFn: spawn });

    expect(spawn).toHaveBeenCalledWith('where.exe', ['openclaw'], expect.anything());
    expect(result.success).toBe(true);
    expect(result.stdout).toContain('openclaw');
  });

  test('returns success=false when process exits non-zero', async () => {
    const spawn = createMockSpawn(1, '');
    const result = await runProcess('where.exe', ['notfound'], { spawnFn: spawn });

    expect(result.success).toBe(false);
  });
});
