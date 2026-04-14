import React, { useEffect, useRef } from 'react';
import type { LogLine } from '../state/types.js';

interface Props {
  logs: readonly LogLine[];
}

export function LogPane({ logs }: Props): React.ReactElement {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="log-pane" role="log" aria-label="Installation log" aria-live="polite">
      <div className="log-pane__header">
        <span className="log-pane__title">Output</span>
        <span className="log-pane__count">{logs.length} lines</span>
      </div>
      <div className="log-pane__body">
        {logs.map((entry, i) => (
          <div key={i} className={`log-line log-line--${entry.stream}`}>
            {entry.line}
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}
