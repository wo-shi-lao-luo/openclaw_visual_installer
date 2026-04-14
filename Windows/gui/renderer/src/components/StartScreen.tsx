import React from 'react';

interface Props {
  onStart: () => void;
}

export function StartScreen({ onStart }: Props): React.ReactElement {
  return (
    <div className="start-screen">
      <div className="start-screen__logo" aria-hidden="true">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <rect width="64" height="64" rx="12" fill="#1e40af" />
          <path d="M16 32l10 10 22-20" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h1 className="start-screen__title">OpenClaw Installer</h1>
      <p className="start-screen__description">
        Install OpenClaw on your Windows machine. The installer will handle
        Node.js setup and configuration automatically.
      </p>
      <button className="btn btn--primary btn--large" onClick={onStart}>
        Install OpenClaw
      </button>
    </div>
  );
}
