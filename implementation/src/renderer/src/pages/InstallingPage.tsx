import React from 'react'
import { useStore } from 'zustand'
import { installerStore } from '../store/installer-store'
import { StepList } from '../components/StepList'

export function InstallingPage(): React.JSX.Element {
  const progressSteps = useStore(installerStore, (s) => s.progressSteps)

  return (
    <div style={styles.page}>
      <div style={styles.spinner} />
      <h2 style={styles.title}>Installing OpenClaw…</h2>
      <p style={styles.subtitle}>This may take a few minutes. Do not close this window.</p>
      {progressSteps.length > 0 && (
        <div style={styles.steps}>
          <StepList steps={progressSteps} />
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, padding: 40 },
  spinner: { width: 36, height: 36, border: '4px solid #22c55e20', borderTop: '4px solid #22c55e', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  title: { margin: 0, fontSize: 20 },
  subtitle: { margin: 0, color: '#a1a1aa', fontSize: 13 },
  steps: { marginTop: 8, alignSelf: 'stretch' }
}
