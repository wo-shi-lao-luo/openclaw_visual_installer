import type { InstallerEvent, SerializedRunResult, SerializedStep } from '../../../shared/ipc-contract.js';

// ── State types ───────────────────────────────────────────────────────────────

export type InstallerPhase = 'idle' | 'running' | 'success' | 'failed';

export interface LogLine {
  line: string;
  stream: 'stdout' | 'stderr' | 'info';
}

export interface StepState {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'skipped' | 'failed';
  detail?: string;
}

export interface InstallerState {
  phase: InstallerPhase;
  mode: 'install' | 'uninstall';
  steps: StepState[];
  logs: LogLine[];
  pendingPrompt?: { id: string; question: string };
  result?: SerializedRunResult;
  errorMessage?: string;
}

// ── Actions ───────────────────────────────────────────────────────────────────

export type InstallerAction =
  | { type: 'START_RUN'; mode: 'install' | 'uninstall' }
  | { type: 'EVENT'; event: InstallerEvent }
  | { type: 'PROMPT_RESPONDED'; id: string; confirmed: boolean };

// ── Constants ─────────────────────────────────────────────────────────────────

const LOG_CAP = 5000;

const DEFAULT_STEPS: StepState[] = [
  { id: 'environment-check', label: 'Environment check', status: 'pending' },
  { id: 'validate', label: 'Validate', status: 'pending' },
  { id: 'install', label: 'Install', status: 'pending' },
  { id: 'verify', label: 'Verify', status: 'pending' },
  { id: 'finalize', label: 'Finalize', status: 'pending' },
];

// ── Factory ───────────────────────────────────────────────────────────────────

export function createInitialState(): InstallerState {
  return {
    phase: 'idle',
    mode: 'install',
    steps: DEFAULT_STEPS.map((s) => ({ ...s })),
    logs: [],
  };
}

// ── Reducer ───────────────────────────────────────────────────────────────────

export function installerReducer(state: InstallerState, action: InstallerAction): InstallerState {
  switch (action.type) {
    case 'START_RUN': {
      return {
        ...createInitialState(),
        phase: 'running',
        mode: action.mode,
      };
    }

    case 'EVENT': {
      return applyEvent(state, action.event);
    }

    case 'PROMPT_RESPONDED': {
      if (state.pendingPrompt?.id !== action.id) return state;
      return { ...state, pendingPrompt: undefined };
    }

    default:
      return state;
  }
}

function applyEvent(state: InstallerState, event: InstallerEvent): InstallerState {
  switch (event.type) {
    case 'log': {
      const newLog: LogLine = { line: event.line, stream: event.stream };
      const logs = [...state.logs, newLog];
      // FIFO eviction: keep the newest LOG_CAP entries
      const trimmedLogs = logs.length > LOG_CAP ? logs.slice(logs.length - LOG_CAP) : logs;
      return { ...state, logs: trimmedLogs };
    }

    case 'step-update': {
      const steps = state.steps.map((step): StepState => {
        if (step.id !== event.id) return step;
        return { ...step, status: event.status, detail: event.detail };
      });
      return { ...state, steps };
    }

    case 'prompt': {
      return { ...state, pendingPrompt: { id: event.id, question: event.question } };
    }

    case 'run-complete': {
      const phase: InstallerPhase = event.result.success ? 'success' : 'failed';
      return { ...state, phase, result: event.result, pendingPrompt: undefined };
    }

    case 'run-error': {
      return { ...state, phase: 'failed', errorMessage: event.message, pendingPrompt: undefined };
    }

    default:
      return state;
  }
}
