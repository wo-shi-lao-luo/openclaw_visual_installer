import React from 'react'
import { useStore } from 'zustand'
import { installerStore } from '../store/installer-store'
import type { InstallMode } from '../../../main/installer/types'

export function WelcomePage(): React.JSX.Element {
  const goTo = useStore(installerStore, (s) => s.goTo)
  const setAssessment = useStore(installerStore, (s) => s.setAssessment)
  const setInstallMode = useStore(installerStore, (s) => s.setInstallMode)
  const installMode = useStore(installerStore, (s) => s.installMode)

  const handleStart = async (mode: InstallMode): Promise<void> => {
    setInstallMode(mode)
    goTo('checking')
    const assessment = await window.installer.checkEnvironment(mode)
    setAssessment(assessment)
  }

  return (
    <div style={styles.page}>
      <div style={styles.icon}>🦞</div>
      <h1 style={styles.title}>OpenClaw Installer</h1>
      <p style={styles.subtitle}>
        Choose how you want OpenClaw installed on your Windows machine.
      </p>

      <div style={styles.modeGrid}>
        <button
          style={installMode === 'wsl' ? { ...styles.modeButton, ...styles.modeButtonActive } : styles.modeButton}
          onClick={() => handleStart('wsl')}
        >
          <div style={styles.modeTitle}>WSL mode</div>
          <div style={styles.modeDesc}>Recommended. Installs OpenClaw inside Ubuntu on WSL.</div>
        </button>

        <button
          style={installMode === 'native' ? { ...styles.modeButton, ...styles.modeButtonActive } : styles.modeButton}
          onClick={() => handleStart('native')}
        >
          <div style={styles.modeTitle}>Windows native</div>
          <div style={styles.modeDesc}>Installs OpenClaw directly on Windows using npm.</div>
        </button>
      </div>

      <p style={styles.note}>
        If you're unsure, start with WSL mode.
      </p>
    </div>
  )
}

const styles = {
  page: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, padding: 40 },
  icon: { fontSize: 64 },
  title: { margin: 0, fontSize: 28, fontWeight: 700 },
  subtitle: { margin: 0, color: '#a1a1aa', textAlign: 'center' as const, maxWidth: 430 },
  modeGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', maxWidth: 560, marginTop: 8 },
  modeButton: { padding: 16, textAlign: 'left' as const, borderRadius: 12, border: '1px solid #27272a', background: '#111113', color: '#f4f4f5', cursor: 'pointer' },
  modeButtonActive: { borderColor: '#3b82f6', boxShadow: '0 0 0 1px #3b82f6 inset' },
  modeTitle: { fontSize: 16, fontWeight: 700, marginBottom: 6 },
  modeDesc: { fontSize: 13, color: '#a1a1aa', lineHeight: 1.5 },
  note: { margin: 0, color: '#71717a', fontSize: 13, textAlign: 'center' as const }
}
