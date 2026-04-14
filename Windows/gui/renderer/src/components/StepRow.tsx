import React from 'react';
import { StatusIcon } from './StatusIcon.js';
import type { StepState } from '../state/types.js';

interface Props {
  step: StepState;
}

export function StepRow({ step }: Props): React.ReactElement {
  return (
    <li className={`step-row step-row--${step.status}`} aria-label={`${step.label}: ${step.status}`}>
      <StatusIcon status={step.status} />
      <span className="step-row__label">{step.label}</span>
      {step.detail && <span className="step-row__detail">{step.detail}</span>}
    </li>
  );
}
