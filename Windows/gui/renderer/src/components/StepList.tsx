import React from 'react';
import { StepRow } from './StepRow.js';
import type { StepState } from '../state/types.js';

interface Props {
  steps: StepState[];
}

export function StepList({ steps }: Props): React.ReactElement {
  return (
    <ul className="step-list" aria-label="Installation steps">
      {steps.map((step) => (
        <StepRow key={step.id} step={step} />
      ))}
    </ul>
  );
}
