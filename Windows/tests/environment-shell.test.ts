import { describe, expect, test } from 'vitest';

import { createAppShellModel, createPhaseOnePlan, detectWindowsEnvironment } from '../src/index';

describe('environment, shell, and orchestrator wiring', () => {
  test('detectWindowsEnvironment returns the Windows scaffold state', () => {
    const environment = detectWindowsEnvironment({ platform: 'win32' });

    expect(environment.platform).toBe('windows');
    expect(environment.supported).toBe(true);
    expect(environment.checks).toHaveLength(2);
    expect(environment.events).toHaveLength(1);
    expect(environment.events[0]).toMatchObject({
      source: 'environment',
      level: 'info',
      message: 'Windows environment checks evaluated.',
    });
  });

  test('createAppShellModel maps supported and blocked environments', () => {
    const supportedEnvironment = detectWindowsEnvironment({ platform: 'win32' });
    const supportedShell = createAppShellModel({ environment: supportedEnvironment });

    expect(supportedShell.phase).toBe('ready-to-install');
    expect(supportedShell.status).toBe('ready');
    expect(supportedShell.notes.map((note) => note.code)).toContain('shell-framework-agnostic');

    const blockedShell = createAppShellModel({
      environment: {
        ...supportedEnvironment,
        supported: false,
        notes: [],
      },
    });

    expect(blockedShell.phase).toBe('environment-check');
    expect(blockedShell.status).toBe('blocked');
  });

  test('createPhaseOnePlan keeps the phase-one scaffold coherent', () => {
    const environment = detectWindowsEnvironment({ platform: 'win32' });
    const shell = createAppShellModel({ environment });
    const plan = createPhaseOnePlan({ environment, shell });

    expect(plan.phase).toBe('phase-one');
    expect(plan.ready).toBe(true);
    expect(plan.steps).toHaveLength(4);
    expect(plan.notes[0]).toMatchObject({
      code: 'phase-one-ready',
      level: 'info',
    });

    const blockedPlan = createPhaseOnePlan({
      environment: {
        ...environment,
        supported: false,
        notes: [],
      },
      shell: {
        ...shell,
        phase: 'environment-check',
        status: 'blocked',
        notes: [],
      },
    });

    expect(blockedPlan.ready).toBe(false);
    expect(blockedPlan.notes[0]).toMatchObject({
      code: 'phase-one-blocked',
      level: 'warning',
    });
  });
});
