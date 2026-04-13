import React from 'react'
import type { EnvironmentBlocker } from '../../main/environment/assessment'

interface Props {
  blockers: EnvironmentBlocker[]
}

export function BlockerList({ blockers }: Props): React.JSX.Element {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {blockers.map((b, i) => (
        <li key={i} style={{ marginBottom: 16, padding: '12px 16px', background: '#1e1e1e', borderRadius: 6, borderLeft: '3px solid #ef4444' }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{b.message}</div>
          {b.userAction && (
            <div style={{ color: '#a1a1aa', fontSize: 13 }}>{b.userAction}</div>
          )}
          {b.canAutoResolve && (
            <div style={{ color: '#60a5fa', fontSize: 12, marginTop: 4 }}>
              This can be resolved automatically.
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
