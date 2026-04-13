import { describe, expect, test } from 'vitest';

import { bootstrapWindowsInstaller } from '../src/index';

describe('bootstrapWindowsInstaller', () => {
  test('returns a coherent Phase 1 bootstrap object on Windows', () => {
    const bootstrap = bootstrapWindowsInstaller({ platform: 'win32' });

    expect(bootstrap.environment.platform).toBe('windows');
    expect(bootstrap.environment.supported).toBe(true);
    expect(bootstrap.environment.checks.map((check) => check.id)).toEqual([
      'platform-windows',
      'host-pending',
    ]);

    expect(bootstrap.shell.title).toBe('OpenClaw Windows Installer');
    expect(bootstrap.shell.phase).toBe('ready-to-install');
    expect(bootstrap.shell.status).toBe('ready');

    expect(bootstrap.plan.phase).toBe('phase-one');
    expect(bootstrap.plan.ready).toBe(true);
    expect(bootstrap.plan.steps.map((step) => step.id)).toEqual([
      'environment-check',
      'validate',
      'install',
      'finalize',
    ]);

    expect(bootstrap.diagnostics.source).toBe('windows-installer');
    expect(bootstrap.diagnostics.summary).toBe('2 events recorded');
    expect(bootstrap.diagnostics.events[0]).toMatchObject({
      source: 'bootstrap',
      level: 'info',
      message: 'Windows installer bootstrap assembled.',
      context: { phase: 'phase-one', ready: true },
    });
    expect(bootstrap.diagnostics.notes.map((note) => note.code)).toEqual(
      expect.arrayContaining(['windows-environment-supported', 'shell-framework-agnostic', 'phase-one-ready']),
    );
  });
});
