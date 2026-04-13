import React from 'react'
import { useStore } from 'zustand'
import { installerStore } from '../store/installer-store'
import { BlockerList } from '../components/BlockerList'

export function NotSupportedPage(): React.JSX.Element {
  const assessment = useStore(installerStore, (s) => s.assessment)

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>System not supported</h2>
      <p style={styles.subtitle}>
        Your system does not meet the minimum requirements to install OpenClaw.
      </p>
      {assessment && <BlockerList blockers={assessment.blockers} />}
    </div>
  )
}

const styles = {
  page: { padding: 40, display: 'flex', flexDirection: 'column' as const, gap: 16, height: '100%' },
  title: { margin: 0, fontSize: 20, color: '#ef4444' },
  subtitle: { margin: 0, color: '#a1a1aa' }
}
