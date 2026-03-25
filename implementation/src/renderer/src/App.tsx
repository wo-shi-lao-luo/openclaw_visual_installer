import React from 'react'
import { useStore } from 'zustand'
import { installerStore } from './store/installer-store'
import { WelcomePage } from './pages/WelcomePage'
import { CheckingPage } from './pages/CheckingPage'
import { NotSupportedPage } from './pages/NotSupportedPage'
import { NeedsSetupPage } from './pages/NeedsSetupPage'
import { ReadyPage } from './pages/ReadyPage'
import { InstallingPage } from './pages/InstallingPage'
import { SuccessPage } from './pages/SuccessPage'
import { FailurePage } from './pages/FailurePage'
import type { InstallerApi } from '../../preload'

declare global {
  interface Window {
    installer: InstallerApi
  }
}

export default function App(): React.JSX.Element {
  const page = useStore(installerStore, (s) => s.page)

  return (
    <div style={styles.shell}>
      {page === 'welcome' && <WelcomePage />}
      {page === 'checking' && <CheckingPage />}
      {page === 'not_supported' && <NotSupportedPage />}
      {page === 'needs_setup' && <NeedsSetupPage />}
      {page === 'ready' && <ReadyPage />}
      {page === 'installing' && <InstallingPage />}
      {page === 'success' && <SuccessPage />}
      {page === 'failure' && <FailurePage />}
    </div>
  )
}

const styles = {
  shell: {
    height: '100vh',
    background: '#09090b',
    color: '#f4f4f5',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    overflow: 'hidden'
  }
}
