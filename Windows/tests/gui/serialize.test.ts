import { describe, it, expect } from 'vitest';
import { serializeRunResult } from '../../gui/main/ipc/serialize.js';
import type { InstallerMvpRunResult } from '../../src/runtime/installer-mvp.js';

function makeSuccessResult(): InstallerMvpRunResult {
  return {
    success: true,
    aborted: false,
    bootstrap: {
      shell: { title: 'OpenClaw', phase: 'complete', status: 'idle', description: '', notes: [] },
      environment: {
        platform: 'windows',
        supported: true,
        checks: [],
        notes: [],
        events: [],
      },
      plan: { phase: 'phase-one', ready: true, steps: [], notes: [] },
      diagnostics: { source: 'test', summary: '', notes: [], events: [] },
    },
    steps: [
      { id: 'environment-check', label: 'Environment check', status: 'completed' },
      { id: 'install', label: 'Install', status: 'completed' },
    ],
    openClawInstallResult: {
      success: true,
      exitCode: 0,
      stdout: 'installed',
      stderr: '',
      message: 'OpenClaw installed successfully.',
    },
    openClawVerifyResult: {
      cliFound: true,
      cliPath: 'C:\\npm\\openclaw.cmd',
      gatewayReachable: false,
      message: 'CLI found',
    },
  };
}

describe('serializeRunResult', () => {
  it('returns a structuredClone-safe copy', () => {
    const result = makeSuccessResult();
    const serialized = serializeRunResult(result);
    // structuredClone should not throw
    expect(() => structuredClone(serialized)).not.toThrow();
  });

  it('preserves success flag', () => {
    const result = makeSuccessResult();
    const serialized = serializeRunResult(result);
    expect(serialized.success).toBe(true);
  });

  it('preserves steps', () => {
    const result = makeSuccessResult();
    const serialized = serializeRunResult(result);
    expect(serialized.steps).toHaveLength(2);
    expect(serialized.steps[0].id).toBe('environment-check');
  });

  it('returns a new object (does not mutate input)', () => {
    const result = makeSuccessResult();
    const serialized = serializeRunResult(result);
    expect(serialized).not.toBe(result);
  });

  it('handles failed result without optional fields', () => {
    const result: InstallerMvpRunResult = {
      success: false,
      aborted: true,
      abortedAt: 'validate',
      bootstrap: makeSuccessResult().bootstrap,
      steps: [],
    };
    const serialized = serializeRunResult(result);
    expect(serialized.success).toBe(false);
    expect(serialized.abortedAt).toBe('validate');
  });

  it('strips any function fields that might sneak in', () => {
    const result = makeSuccessResult() as unknown as Record<string, unknown>;
    result['someFunction'] = () => 'oops';
    const serialized = serializeRunResult(result as any);
    expect(typeof (serialized as any)['someFunction']).toBe('undefined');
  });
});
