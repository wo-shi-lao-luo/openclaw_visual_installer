import React from 'react';
import type { StepState } from '../state/types.js';
import { useLocale } from '../i18n/LocaleContext.js';
import { STEP_LABEL_KEYS } from '../i18n/translations.js';

interface Props {
  steps: readonly StepState[];
}

function NodeIcon({ status }: { status: StepState['status'] }): React.ReactElement {
  if (status === 'completed' || status === 'skipped') {
    return (
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <path d="M1.5 5l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (status === 'failed') {
    return (
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <path d="M2 2l6 6M8 2L2 8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (status === 'running') {
    return <span className="htl-dot htl-dot--running" />;
  }
  return <span className="htl-dot" />;
}

function nodeClass(status: StepState['status']): string {
  if (status === 'running')                           return 'htl-node htl-node--running';
  if (status === 'completed' || status === 'skipped') return 'htl-node htl-node--done';
  if (status === 'failed')                            return 'htl-node htl-node--failed';
  return 'htl-node';
}

function lineClass(status: StepState['status']): string {
  return status === 'completed' || status === 'skipped' ? 'htl-line htl-line--done' : 'htl-line';
}

export function HorizontalTimeline({ steps }: Props): React.ReactElement {
  const { t } = useLocale();

  return (
    <div className="htl" aria-label="Installation steps">
      {steps.map((step, i) => {
        const labelKey = STEP_LABEL_KEYS[step.id];
        const label = labelKey ? t(labelKey) : step.label;
        return (
          <React.Fragment key={step.id}>
            <div className="htl-step">
              <div className={nodeClass(step.status)}>
                <NodeIcon status={step.status} />
              </div>
              <span className={`htl-label htl-label--${step.status}`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={lineClass(step.status)} aria-hidden="true" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
