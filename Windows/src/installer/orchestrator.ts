import type { EnvironmentCheckResult, PhaseOnePlan, InstallerStep, ShellModel } from '../shared/types.js';

const PHASE_ONE_STEPS: InstallerStep[] = [
  {
    id: 'environment-check',
    label: 'Environment check',
    purpose: 'Confirm the local machine is ready for the Windows installer path.',
  },
  {
    id: 'validate',
    label: 'Validate prerequisites',
    purpose: 'Confirm the installer can write to its local install root before copying payload files.',
  },
  {
    id: 'install',
    label: 'Install payload',
    purpose: 'Copy the runnable Windows MVP payload into the local install directory.',
  },
  {
    id: 'finalize',
    label: 'Finalize setup',
    purpose: 'Write the manifest, expose the launcher, and complete the install flow.',
  },
];

export interface PhaseOnePlanInput {
  environment: EnvironmentCheckResult;
  shell: ShellModel;
}

export function createPhaseOnePlan(input: PhaseOnePlanInput): PhaseOnePlan {
  const ready = input.environment.supported;

  const notes = ready
    ? [
        {
          code: 'phase-one-ready',
          level: 'info' as const,
          message: `Shell "${input.shell.title}" can proceed through the Phase 1 scaffold.`,
        },
      ]
    : [
        {
          code: 'phase-one-blocked',
          level: 'warning' as const,
          message: 'Environment checks are not ready yet, so the installer plan remains in scaffold mode.',
        },
      ];

  return {
    phase: 'phase-one',
    ready,
    steps: PHASE_ONE_STEPS,
    notes,
  };
}
