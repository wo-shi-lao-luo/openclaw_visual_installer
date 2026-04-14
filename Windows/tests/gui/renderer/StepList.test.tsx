import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StepList } from '../../../gui/renderer/src/components/StepList.js';
import type { StepState } from '../../../gui/renderer/src/state/types.js';

const STEPS: StepState[] = [
  { id: 'environment-check', label: 'Environment check', status: 'completed' },
  { id: 'validate', label: 'Validate', status: 'completed' },
  { id: 'install', label: 'Install', status: 'running' },
  { id: 'verify', label: 'Verify', status: 'pending' },
  { id: 'finalize', label: 'Finalize', status: 'pending' },
];

describe('StepList', () => {
  it('renders all steps', () => {
    render(<StepList steps={STEPS} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(5);
  });

  it('shows each step label', () => {
    render(<StepList steps={STEPS} />);
    expect(screen.getByText('Environment check')).toBeInTheDocument();
    expect(screen.getByText('Install')).toBeInTheDocument();
    expect(screen.getByText('Verify')).toBeInTheDocument();
  });

  it('marks the running step with running status in aria-label', () => {
    render(<StepList steps={STEPS} />);
    expect(screen.getByLabelText('Install: running')).toBeInTheDocument();
  });

  it('marks completed steps', () => {
    render(<StepList steps={STEPS} />);
    expect(screen.getByLabelText('Environment check: completed')).toBeInTheDocument();
  });

  it('shows step detail when present', () => {
    const stepsWithDetail: StepState[] = [
      ...STEPS.slice(0, 2),
      { id: 'install', label: 'Install', status: 'completed', detail: 'OpenClaw installed.' },
      ...STEPS.slice(3),
    ];
    render(<StepList steps={stepsWithDetail} />);
    expect(screen.getByText('OpenClaw installed.')).toBeInTheDocument();
  });
});
