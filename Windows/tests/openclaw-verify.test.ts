import { EventEmitter } from 'node:events';
import { describe, expect, test, vi } from 'vitest';
import type { SpawnFn } from '../src/powershell/ps-runner';
import { verifyOpenClaw } from '../src/openclaw/openclaw-verify';

type SpawnCall = [exitCode: number, stdout: string];

function createSequentialMockSpawn(calls: SpawnCall[]): SpawnFn {
  let callIndex = 0;
  return vi.fn().mockImplementation(() => {
    const [exitCode, stdout] = calls[callIndex] ?? [1, ''];
    callIndex += 1;
    const child = new EventEmitter() as ReturnType<SpawnFn>;
    (child as unknown as { stdout: EventEmitter; stderr: EventEmitter }).stdout = new EventEmitter();
    (child as unknown as { stderr: EventEmitter }).stderr = new EventEmitter();
    setImmediate(() => {
      if (stdout) (child as unknown as { stdout: EventEmitter }).stdout.emit('data', Buffer.from(stdout));
      child.emit('close', exitCode);
    });
    return child;
  });
}

describe('verifyOpenClaw', () => {
  test('returns cliFound=true with path when where.exe finds openclaw', async () => {
    const spawn = createSequentialMockSpawn([
      [0, 'C:\\Users\\user\\.local\\bin\\openclaw.cmd\r\n'],
    ]);

    const result = await verifyOpenClaw({ spawnFn: spawn });

    expect(result.cliFound).toBe(true);
    expect(result.cliPath).toBe('C:\\Users\\user\\.local\\bin\\openclaw.cmd');
    expect(result.message).toContain('openclaw.cmd');
  });

  test('returns cliFound=false when where.exe exits non-zero', async () => {
    const spawn = createSequentialMockSpawn([[1, '']]);
    const result = await verifyOpenClaw({ spawnFn: spawn });

    expect(result.cliFound).toBe(false);
    expect(result.message).toContain('not found');
  });

  test('returns cliFound=false when where.exe returns only whitespace', async () => {
    const spawn = createSequentialMockSpawn([[0, '   \r\n']]);
    const result = await verifyOpenClaw({ spawnFn: spawn });

    expect(result.cliFound).toBe(false);
  });

  test('only calls where.exe — no additional processes', async () => {
    const spawn = createSequentialMockSpawn([
      [0, 'C:\\path\\openclaw.cmd\n'],
    ]);
    await verifyOpenClaw({ spawnFn: spawn });

    expect(spawn).toHaveBeenCalledTimes(1);
    const calls = (spawn as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls[0][0]).toBe('where.exe');
  });

  test('returns first line only when where.exe returns multiple paths', async () => {
    const spawn = createSequentialMockSpawn([
      [0, 'C:\\first\\openclaw.cmd\nC:\\second\\openclaw.cmd\n'],
    ]);
    const result = await verifyOpenClaw({ spawnFn: spawn });

    expect(result.cliFound).toBe(true);
    expect(result.cliPath).toBe('C:\\first\\openclaw.cmd');
  });
});
