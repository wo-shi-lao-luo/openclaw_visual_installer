import type { EnvironmentCheckResult, PhaseOnePlan, InstallerStep, ShellModel } from '../shared/types.js';

const PHASE_TWO_STEPS: InstallerStep[] = [
  {
    id: 'environment-check',
    label: 'Environment check',
    purpose: 'Confirm this machine runs Windows.',
  },
  {
    id: 'validate',
    label: 'Validate prerequisites',
    purpose: 'Confirm the installer can write to its local install root before running.',
  },
  {
    id: 'install',
    label: 'Install OpenClaw',
    purpose: 'Run the OpenClaw PowerShell install script (https://openclaw.ai/install.ps1).',
  },
  {
    id: 'verify',
    label: 'Verify installation',
    purpose: 'Confirm the OpenClaw CLI is on PATH after installation.',
  },
  {
    id: 'finalize',
    label: 'Finalize setup',
    purpose: 'Write the install manifest and set up the local launcher.',
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
          code: 'phase-two-ready',
          level: 'info' as const,
          message: `Shell "${input.shell.title}" is ready to install OpenClaw.`,
        },
      ]
    : [
        {
          code: 'phase-two-blocked',
          level: 'warning' as const,
          message: 'Environment check did not pass. The installer cannot proceed on this host.',
        },
      ];

  return {
    phase: 'phase-one',
    ready,
    steps: PHASE_TWO_STEPS,
    notes,
  };
}
