import React from 'react';
import type { SerializedRunResult } from '../../../shared/ipc-contract.js';

interface Props {
  success: boolean;
  result?: SerializedRunResult;
  errorMessage?: string;
  onRestart: () => void;
}

export function ResultScreen({ success, result, errorMessage, onRestart }: Props): React.ReactElement {
  const cliPath = result?.openClawVerifyResult?.cliPath;

  if (success) {
    return (
      <div className="result-screen result-screen--success">
        <svg aria-hidden="true" width="56" height="56" viewBox="0 0 56 56" fill="none">
          <circle cx="28" cy="28" r="28" fill="#22c55e" />
          <path d="M16 28l9 9 15-14" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h2 className="result-screen__title">OpenClaw installed!</h2>
        {cliPath && (
          <p className="result-screen__detail">CLI: <code>{cliPath}</code></p>
        )}
        <p className="result-screen__instruction">
          Open a new PowerShell window and run: <code>openclaw --version</code>
        </p>
      </div>
    );
  }

  const reason = result?.aborted
    ? 'Installation was cancelled.'
    : errorMessage ?? result?.openClawInstallResult?.message ?? 'Installation failed.';

  return (
    <div className="result-screen result-screen--failed">
      <svg aria-hidden="true" width="56" height="56" viewBox="0 0 56 56" fill="none">
        <circle cx="28" cy="28" r="28" fill="#ef4444" />
        <path d="M18 18l20 20M38 18L18 38" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
      <h2 className="result-screen__title">Installation failed</h2>
      <p className="result-screen__detail">{reason}</p>
      <button className="btn btn--secondary" onClick={onRestart}>
        Try again
      </button>
    </div>
  );
}
