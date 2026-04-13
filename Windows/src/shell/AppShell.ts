import type { EnvironmentCheckResult, InstallerNote, ShellModel } from '../shared/types.js';

export interface AppShellInput {
  environment: EnvironmentCheckResult;
}

export function createAppShellModel(input: AppShellInput): ShellModel {
  const status = input.environment.supported ? 'ready' : 'blocked';
  const phase = input.environment.supported ? 'ready-to-install' : 'environment-check';

  const notes: InstallerNote[] = [
    {
      code: 'shell-framework-agnostic',
      level: 'info',
      message: 'Shell model stays framework-agnostic while the host choice remains pending.',
    },
    ...input.environment.notes,
  ];

  return {
    title: 'OpenClaw Windows Installer',
    phase,
    status,
    description: 'Starter shell model for the native Windows installer surface.',
    notes,
  };
}
