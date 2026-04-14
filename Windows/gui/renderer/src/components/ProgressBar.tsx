import React from 'react';
import type { StepState } from '../state/types.js';
import type { InstallerPhase } from '../state/types.js';

interface Props {
  steps: readonly StepState[];
  phase: InstallerPhase;
}

function calcProgress(steps: readonly StepState[], phase: InstallerPhase): number {
  if (phase === 'success') return 100;
  if (steps.length === 0)  return 0;
  const per = 100 / steps.length;
  let total = 0;
  for (const s of steps) {
    if (s.status === 'completed' || s.status === 'skipped') total += per;
    else if (s.status === 'running')                        total += per * 0.5;
    else if (s.status === 'failed')                         total += per * 0.3;
  }
  return Math.round(Math.min(total, 100));
}

export function ProgressBar({ steps, phase }: Props): React.ReactElement {
  const pct = calcProgress(steps, phase);
  const failed = phase === 'failed';

  return (
    <div className="progress-wrap">
      <div className="progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div
          className={`progress-fill ${failed ? 'progress-fill--failed' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`progress-pct ${failed ? 'progress-pct--failed' : ''}`}>
        {pct}%
      </span>
    </div>
  );
}
