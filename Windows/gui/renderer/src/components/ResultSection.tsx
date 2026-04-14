import React from 'react';
import type { SerializedRunResult } from '../../../shared/ipc-contract.js';
import { useLocale } from '../i18n/LocaleContext.js';

interface Props {
  success: boolean;
  result?: SerializedRunResult;
  errorMessage?: string;
  onRestart: () => void;
}

export function ResultSection({ success, result, errorMessage, onRestart }: Props): React.ReactElement {
  const { t } = useLocale();
  const cliPath = result?.openClawVerifyResult?.cliPath;

  if (success) {
    return (
      <div className="result-section result-section--success">
        <div className="result-section__header">
          <span className="result-section__icon" aria-hidden="true">✅</span>
          <span className="result-section__title result-section__title--success">
            {t('result_success')}
          </span>
        </div>
        {cliPath && (
          <p className="result-section__detail">{t('result_cli')} <code>{cliPath}</code></p>
        )}
        <p className="result-section__hint">
          {t('result_hint')} <code>openclaw --version</code>
        </p>
      </div>
    );
  }

  const reason = result?.aborted
    ? t('result_cancelled')
    : errorMessage ?? result?.openClawInstallResult?.message ?? t('result_failed');

  return (
    <div className="result-section result-section--failed">
      <div className="result-section__header">
        <span className="result-section__icon" aria-hidden="true">❌</span>
        <span className="result-section__title result-section__title--failed">
          {t('result_failed')}
        </span>
      </div>
      <p className="result-section__detail">{reason}</p>
      <button className="btn btn--secondary" onClick={onRestart}>
        {t('result_retry')}
      </button>
    </div>
  );
}
