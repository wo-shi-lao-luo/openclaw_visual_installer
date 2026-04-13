import React from 'react'
import { useStore } from 'zustand'
import { installerStore } from '../store/installer-store'
import { BlockerList } from '../components/BlockerList'

export function NeedsSetupPage(): React.JSX.Element {
  const assessment = useStore(installerStore, (s) => s.assessment)
  const goTo = useStore(installerStore, (s) => s.goTo)
  const setAssessment = useStore(installerStore, (s) => s.setAssessment)
  const installMode = useStore(installerStore, (s) => s.installMode)

  const handleRecheck = async (): Promise<void> => {
    goTo('checking')
    const updated = await window.installer.checkEnvironment(installMode)
    setAssessment(updated)
  }

  const modeLabel = installMode === 'native' ? 'native Windows mode' : 'WSL mode'

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Setup required</h2>
      <p style={styles.subtitle}>
        The following issues must be resolved before OpenClaw can be installed in {modeLabel}.
      </p>
      {assessment && <BlockerList blockers={assessment.blockers} />}
      <p style={styles.hint}>
        Follow the steps above, then click <strong>Re-check</strong> to continue.
      </p>
      <button style={styles.button} onClick={handleRecheck}>
        Re-check Environment
      </button>
    </div>
  )
}

const styles = {
  page: { padding: 40, display: 'flex', flexDirection: 'column' as const, gap: 16, height: '100%' },
  title: { margin: 0, fontSize: 20, color: '#f59e0b' },
  subtitle: { margin: 0, color: '#a1a1aa' },
  hint: { margin: 0, color: '#a1a1aa', fontSize: 13 },
  button: { alignSelf: 'flex-start', padding: '10px 24px', fontSize: 14, fontWeight: 600, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }
}
