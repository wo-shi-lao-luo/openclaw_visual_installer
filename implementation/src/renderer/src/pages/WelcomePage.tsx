import React from 'react'
import { useStore } from 'zustand'
import { installerStore } from '../store/installer-store'

export function WelcomePage(): React.JSX.Element {
  const goTo = useStore(installerStore, (s) => s.goTo)
  const setAssessment = useStore(installerStore, (s) => s.setAssessment)

  const handleStart = async (): Promise<void> => {
    goTo('checking')
    const assessment = await window.installer.checkEnvironment()
    setAssessment(assessment)
  }

  return (
    <div style={styles.page}>
      <div style={styles.icon}>🦞</div>
      <h1 style={styles.title}>OpenClaw Installer</h1>
      <p style={styles.subtitle}>
        This installer will set up OpenClaw on your Windows machine using WSL.
      </p>
      <button style={styles.button} onClick={handleStart}>
        Get Started
      </button>
    </div>
  )
}

const styles = {
  page: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, padding: 40 },
  icon: { fontSize: 64 },
  title: { margin: 0, fontSize: 28, fontWeight: 700 },
  subtitle: { margin: 0, color: '#a1a1aa', textAlign: 'center' as const, maxWidth: 400 },
  button: { marginTop: 16, padding: '12px 32px', fontSize: 15, fontWeight: 600, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }
}
