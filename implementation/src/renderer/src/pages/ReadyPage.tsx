import React from 'react'
import { useStore } from 'zustand'
import { installerStore } from '../store/installer-store'

export function ReadyPage(): React.JSX.Element {
  const { goTo, setInstallResult, addProgressStep } = useStore(installerStore, (s) => s)

  const handleInstall = async (): Promise<void> => {
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
      <div style={styles.icon}>✓</div>
      <h2 style={styles.title}>Ready to install</h2>
      <p style={styles.subtitle}>
        Your environment is set up correctly. Click <strong>Install</strong> to begin.
      </p>
      <p style={styles.detail}>
        OpenClaw will be installed in WSL (Ubuntu) using the official install script.
      </p>
      <button style={styles.button} onClick={handleInstall}>
        Install OpenClaw
      </button>
    </div>
  )
}

const styles = {
  page: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, padding: 40 },
  icon: { fontSize: 48, color: '#22c55e' },
  title: { margin: 0, fontSize: 22, fontWeight: 700 },
  subtitle: { margin: 0, color: '#d4d4d8', textAlign: 'center' as const },
  detail: { margin: 0, color: '#71717a', fontSize: 13, textAlign: 'center' as const, maxWidth: 380 },
  button: { marginTop: 8, padding: '12px 36px', fontSize: 15, fontWeight: 600, background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }
}
