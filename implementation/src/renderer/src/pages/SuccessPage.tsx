import React from 'react'
import { useStore } from 'zustand'
import { installerStore } from '../store/installer-store'
import { StepList } from '../components/StepList'

export function SuccessPage(): React.JSX.Element {
  const installResult = useStore(installerStore, (s) => s.installResult)
  const alreadyInstalled = installResult?.alreadyInstalled === true

  return (
    <div style={styles.page}>
      <div style={styles.icon}>{alreadyInstalled ? '✓' : '🎉'}</div>
      <h2 style={styles.title}>
        {alreadyInstalled
          ? 'OpenClaw is already installed'
          : 'OpenClaw installed successfully!'}
      </h2>
      <p style={styles.subtitle}>
        {alreadyInstalled
          ? 'An existing OpenClaw installation was found on this machine. No changes were made.'
          : 'OpenClaw is ready to use. Run "openclaw gateway start" in your WSL terminal to start the gateway.'}
      </p>
      {installResult && installResult.steps.length > 0 && (
        <div style={styles.steps}>
          <StepList steps={installResult.steps} />
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, padding: 40 },
  icon: { fontSize: 56 },
  title: { margin: 0, fontSize: 22, fontWeight: 700, color: '#22c55e' },
  subtitle: { margin: 0, color: '#a1a1aa', textAlign: 'center' as const, maxWidth: 420 },
  steps: { marginTop: 8, alignSelf: 'stretch' }
}
