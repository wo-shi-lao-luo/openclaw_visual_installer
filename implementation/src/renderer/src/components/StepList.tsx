import React from 'react'
import type { StepRecord } from '../../../main/installer/types'

const STEP_LABELS: Record<StepRecord['step'], string> = {
  detect_existing: 'Checking for existing installation',
  run_script: 'Running install script',
  verify_install: 'Verifying OpenClaw binary',
  start_gateway: 'Starting OpenClaw gateway',
  verify_gateway: 'Verifying gateway is running'
}

interface Props {
  steps: StepRecord[]
}

export function StepList({ steps }: Props): React.JSX.Element {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {steps.map((s, i) => (
        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 16 }}>{s.success ? '✓' : '✗'}</span>
          <span style={{ color: s.success ? '#22c55e' : '#ef4444' }}>
            {STEP_LABELS[s.step]}
          </span>
        </li>
      ))}
    </ul>
  )
}
