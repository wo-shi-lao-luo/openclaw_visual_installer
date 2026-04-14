import React, { useEffect, useRef } from 'react';
import type { LogLine } from '../state/types.js';

interface Props {
  logs: LogLine[];
}

export function LogPane({ logs }: Props): React.ReactElement {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ behavior: 'auto' });
  }, [logs]);

  return (
    <div className="log-pane" role="log" aria-label="Installation output" aria-live="polite">
      {logs.map((entry, i) => (
        <div
          key={i}
          className={`log-pane__line log-pane__line--${entry.stream}`}
        >
          {entry.line}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
