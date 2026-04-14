import React from 'react';
import type { StepState } from '../state/types.js';

interface Props {
  status: StepState['status'];
}

export function StatusIcon({ status }: Props): React.ReactElement {
  switch (status) {
    case 'completed':
      return (
        <svg aria-label="completed" width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="9" fill="#22c55e" />
          <path d="M5 9l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'running':
      return (
        <svg aria-label="running" width="18" height="18" viewBox="0 0 18 18" className="spin">
          <circle cx="9" cy="9" r="7" stroke="#3b82f6" strokeWidth="2" strokeDasharray="22 22" strokeLinecap="round" fill="none" />
        </svg>
      );
    case 'failed':
      return (
        <svg aria-label="failed" width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="9" fill="#ef4444" />
          <path d="M6 6l6 6M12 6l-6 6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'skipped':
      return (
        <svg aria-label="skipped" width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="9" fill="#9ca3af" />
          <path d="M6 9h6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'pending':
    default:
      return (
        <svg aria-label="pending" width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="8" stroke="#d1d5db" strokeWidth="2" />
        </svg>
      );
  }
}
