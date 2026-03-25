import React from 'react'
import { useStore } from 'zustand'
import { installerStore } from '../store/installer-store'
import { StepList } from '../components/StepList'

export function FailurePage(): React.JSX.Element {
  const { installResult, goTo, setInstallResult, addProgressStep } = useStore(installerStore, (s) => s)
  const error = installResult?.error

  const handleRetry = async (): Promise<void> => {
    goTo('installing')
    const unsubscribe = window.installer.onInstallProgress((step) => {
      addProgressStep(step)
    })
    const result = await window.installer.startInstall()
    unsubscribe()
    setInstallResult(result)
  }

  return (
    <div style={styles.page}>
      <div style={styles.icon}>✗</div>
      <h2 style={styles.title}>Installation failed</h2>
      {error && (
        <div style={styles.errorBox}>
          <div style={styles.errorStep}>Failed at: {error.step}</div>
          <div style={styles.errorMsg}>{error.message}</div>
          {error.cause && <div style={styles.errorCause}>{error.cause}</div>}
        </div>
      )}
      {installResult && installResult.steps.length > 0 && (
        <div style={styles.steps}>
          <StepList steps={installResult.steps} />
        </div>
      )}
      {error?.recoverable && (
        <button style={styles.button} onClick={handleRetry}>
          Retry Installation
        </button>
      )}
    </div>
  )
}

const styles = {
  page: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', padding: 40, height: '100%', gap: 16 },
  icon: { fontSize: 48, color: '#ef4444' },
  title: { margin: 0, fontSize: 22, fontWeight: 700, color: '#ef4444' },
  errorBox: { alignSelf: 'stretch', background: '#1e1e1e', borderRadius: 8, padding: 16, borderLeft: '3px solid #ef4444' },
  errorStep: { fontSize: 12, color: '#71717a', marginBottom: 4 },
  errorMsg: { fontWeight: 600 },
  errorCause: { fontSize: 13, color: '#a1a1aa', marginTop: 4 },
  steps: { alignSelf: 'stretch' },
  button: { padding: '10px 28px', fontSize: 14, fontWeight: 600, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }
}
