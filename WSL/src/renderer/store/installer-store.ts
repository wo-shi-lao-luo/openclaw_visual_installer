import { createStore } from 'zustand/vanilla'
import type { EnvironmentAssessment } from '../../main/environment/assessment'
import type { InstallMode, InstallResult, StepRecord } from '../../main/installer/types'

export type WizardPage =
  | 'welcome'
  | 'checking'
  | 'not_supported'
  | 'needs_setup'
  | 'ready'
  | 'installing'
  | 'success'
  | 'failure'

export interface InstallerState {
  page: WizardPage
  installMode: InstallMode
  assessment: EnvironmentAssessment | null
  installResult: InstallResult | null
  progressSteps: StepRecord[]
  // actions
  goTo: (page: WizardPage) => void
  setInstallMode: (mode: InstallMode) => void
  setAssessment: (assessment: EnvironmentAssessment) => void
  setInstallResult: (result: InstallResult) => void
  addProgressStep: (step: StepRecord) => void
}

function pageFromAssessmentStatus(status: EnvironmentAssessment['status']): WizardPage {
  switch (status) {
    case 'ready': return 'ready'
    case 'not_supported': return 'not_supported'
    case 'needs_setup': return 'needs_setup'
    default: return 'failure'
  }
}

function pageFromInstallState(state: InstallResult['state']): WizardPage {
  return state === 'installed' ? 'success' : 'failure'
}

export function createInstallerStore() {
  return createStore<InstallerState>((set) => ({
    page: 'welcome',
    installMode: 'wsl',
    assessment: null,
    installResult: null,
    progressSteps: [],

    goTo: (page) =>
      set((s) => ({
        page,
        // clear progress whenever we navigate to installing
        progressSteps: page === 'installing' ? [] : s.progressSteps
      })),

    setInstallMode: (installMode) => set({ installMode }),

    setAssessment: (assessment) =>
      set({ assessment, page: pageFromAssessmentStatus(assessment.status) }),

    setInstallResult: (installResult) =>
      set({ installResult, page: pageFromInstallState(installResult.state) }),

    addProgressStep: (step) =>
      set((s) => ({ progressSteps: [...s.progressSteps, step] }))
  }))
}

// Singleton store for use in React components
export const installerStore = createInstallerStore()
