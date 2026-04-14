export type DiagnosticLevel = 'info' | 'warning' | 'error';

export type InstallerStepId = 'environment-check' | 'validate' | 'install' | 'verify' | 'finalize';

export type InstallerPhase = 'booting' | 'environment-check' | 'ready-to-install' | 'installing' | 'complete';

export type ShellStatus = 'idle' | 'checking' | 'ready' | 'blocked';

export interface InstallerNote {
  code: string;
  message: string;
  level: DiagnosticLevel;
}

export interface DiagnosticsEvent {
  id: string;
  source: string;
  level: DiagnosticLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

export interface DiagnosticsReport {
  source: string;
  summary: string;
  notes: InstallerNote[];
  events: DiagnosticsEvent[];
}

export interface EnvironmentCheckItem {
  id: string;
  label: string;
  passed: boolean;
  message: string;
}

export interface EnvironmentCheckResult {
  platform: 'windows';
  supported: boolean;
  checks: EnvironmentCheckItem[];
  notes: InstallerNote[];
  events: DiagnosticsEvent[];
}

export interface ShellModel {
  title: string;
  phase: InstallerPhase;
  status: ShellStatus;
  description: string;
  notes: InstallerNote[];
}

export interface InstallerStep {
  id: InstallerStepId;
  label: string;
  purpose: string;
}

export interface PhaseOnePlan {
  phase: 'phase-one';
  ready: boolean;
  steps: InstallerStep[];
  notes: InstallerNote[];
}

export interface WindowsInstallerBootstrap {
  shell: ShellModel;
  environment: EnvironmentCheckResult;
  plan: PhaseOnePlan;
  diagnostics: DiagnosticsReport;
}
