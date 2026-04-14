import React from 'react';
import type { LogLine, StepState } from '../state/types.js';
import { useLocale } from '../i18n/LocaleContext.js';
import { STEP_STREAM_KEYS } from '../i18n/translations.js';

interface Props {
  logs: readonly LogLine[];
  steps: readonly StepState[];
}

export function StreamMessage({ logs, steps }: Props): React.ReactElement {
  const { locale, t } = useLocale();

  const runningStep = steps.find((s) => s.status === 'running');
  const lastLine = [...logs].reverse().find((l) => l.line.trim() !== '')?.line ?? '';

  let message: string;

  if (locale === 'zh') {
    // Chinese: always show translated step progress, never raw English logs
    if (runningStep) {
      const key = STEP_STREAM_KEYS[runningStep.id];
      message = key ? t(key) : t('stream_waiting');
    } else {
      message = t('stream_waiting');
    }
  } else {
    // English: show raw log output for live feel, fall back to waiting
    message = lastLine || t('stream_waiting');
  }

  return (
    <div className="stream-message" aria-live="polite" aria-atomic="true">
      <span className="stream-message__prefix" aria-hidden="true">›</span>
      <span className="stream-message__text">{message}</span>
      <span className="stream-message__cursor" aria-hidden="true" />
    </div>
  );
}
