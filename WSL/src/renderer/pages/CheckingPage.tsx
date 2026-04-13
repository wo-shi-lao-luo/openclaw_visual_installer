import React from 'react'

export function CheckingPage(): React.JSX.Element {
  return (
    <div style={styles.page}>
      <div style={styles.spinner} />
      <h2 style={styles.title}>Checking your environment…</h2>
      <p style={styles.subtitle}>This will only take a moment.</p>
    </div>
  )
}

const styles = {
  page: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16 },
  spinner: { width: 40, height: 40, border: '4px solid #3b82f620', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  title: { margin: 0, fontSize: 20 },
  subtitle: { margin: 0, color: '#a1a1aa' }
}
