import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  installerReducer,
  type InstallerState,
} from '../../../gui/renderer/src/state/installerStore.js';
import type { InstallerEvent } from '../../../gui/shared/ipc-contract.js';

function applyEvent(state: InstallerState, event: InstallerEvent): InstallerState {
  return installerReducer(state, { type: 'EVENT', event });
}

describe('createInitialState', () => {
  it('starts in idle phase with 5 pending steps', () => {
    const state = createInitialState();
    expect(state.phase).toBe('idle');
    expect(state.steps).toHaveLength(5);
    expect(state.steps.every((s) => s.status === 'pending')).toBe(true);
  });

  it('starts with empty logs', () => {
    const state = createInitialState();
    expect(state.logs).toHaveLength(0);
  });

  it('starts with no pending prompt', () => {
    const state = createInitialState();
    expect(state.pendingPrompt).toBeUndefined();
  });
});

describe('installerReducer', () => {
  describe('START_RUN action', () => {
    it('transitions from idle to running', () => {
      const state = createInitialState();
      const next = installerReducer(state, { type: 'START_RUN', mode: 'install' });
      expect(next.phase).toBe('running');
    });

    it('resets steps to pending on start', () => {
      const state = createInitialState();
      // Simulate a previous run having step statuses
      const modifiedState: InstallerState = {
        ...state,
        steps: state.steps.map((s) => ({ ...s, status: 'completed' as const })),
      };
      const next = installerReducer(modifiedState, { type: 'START_RUN', mode: 'install' });
      expect(next.steps.every((s) => s.status === 'pending')).toBe(true);
    });

    it('clears logs on start', () => {
      const state: InstallerState = {
        ...createInitialState(),
        logs: [{ line: 'old line', stream: 'info' }],
      };
      const next = installerReducer(state, { type: 'START_RUN', mode: 'install' });
      expect(next.logs).toHaveLength(0);
    });
  });

  describe('EVENT action — log', () => {
    it('appends a log line to the logs array', () => {
      const state = createInitialState();
      const event: InstallerEvent = { type: 'log', line: 'Installing...', stream: 'stdout' };
      const next = applyEvent(state, event);
      expect(next.logs).toHaveLength(1);
      expect(next.logs[0].line).toBe('Installing...');
      expect(next.logs[0].stream).toBe('stdout');
    });

    it('appends multiple log lines in order', () => {
      let state = createInitialState();
      state = applyEvent(state, { type: 'log', line: 'line 1', stream: 'info' });
      state = applyEvent(state, { type: 'log', line: 'line 2', stream: 'info' });
      expect(state.logs[0].line).toBe('line 1');
      expect(state.logs[1].line).toBe('line 2');
    });

    it('evicts oldest log entries when cap is exceeded', () => {
      const LOG_CAP = 5000;
      let state = createInitialState();
      for (let i = 0; i < LOG_CAP + 10; i++) {
        state = applyEvent(state, { type: 'log', line: `line ${i}`, stream: 'info' });
      }
      expect(state.logs.length).toBeLessThanOrEqual(LOG_CAP);
      // Newest line should be preserved
      expect(state.logs[state.logs.length - 1].line).toBe(`line ${LOG_CAP + 9}`);
    });
  });

  describe('EVENT action — step-update', () => {
    it('updates the matching step status', () => {
      const state = createInitialState();
      const event: InstallerEvent = { type: 'step-update', id: 'install', status: 'running' };
      const next = applyEvent(state, event);
      const installStep = next.steps.find((s) => s.id === 'install');
      expect(installStep?.status).toBe('running');
    });

    it('updates step detail when provided', () => {
      const state = createInitialState();
      const event: InstallerEvent = {
        type: 'step-update',
        id: 'verify',
        status: 'completed',
        detail: 'CLI found at C:\\npm\\openclaw.cmd',
      };
      const next = applyEvent(state, event);
      const verifyStep = next.steps.find((s) => s.id === 'verify');
      expect(verifyStep?.detail).toBe('CLI found at C:\\npm\\openclaw.cmd');
    });

    it('does not mutate other steps', () => {
      const state = createInitialState();
      const event: InstallerEvent = { type: 'step-update', id: 'install', status: 'running' };
      const next = applyEvent(state, event);
      const otherSteps = next.steps.filter((s) => s.id !== 'install');
      expect(otherSteps.every((s) => s.status === 'pending')).toBe(true);
    });
  });

  describe('EVENT action — prompt', () => {
    it('sets pendingPrompt', () => {
      const state = createInitialState();
      const event: InstallerEvent = { type: 'prompt', id: 'p1', question: 'Install OpenClaw?' };
      const next = applyEvent(state, event);
      expect(next.pendingPrompt).toEqual({ id: 'p1', question: 'Install OpenClaw?' });
    });
  });

  describe('PROMPT_RESPONDED action', () => {
    it('clears pendingPrompt', () => {
      let state = createInitialState();
      state = applyEvent(state, { type: 'prompt', id: 'p1', question: 'Install?' });
      const next = installerReducer(state, { type: 'PROMPT_RESPONDED', id: 'p1', confirmed: true });
      expect(next.pendingPrompt).toBeUndefined();
    });
  });

  describe('EVENT action — run-complete', () => {
    it('transitions to success phase on successful result', () => {
      const state = createInitialState();
      const event: InstallerEvent = {
        type: 'run-complete',
        result: {
          success: true,
          aborted: false,
          steps: [],
          bootstrap: {},
        },
      };
      const next = applyEvent(state, event);
      expect(next.phase).toBe('success');
    });

    it('transitions to failed phase on unsuccessful result', () => {
      const state = createInitialState();
      const event: InstallerEvent = {
        type: 'run-complete',
        result: {
          success: false,
          aborted: false,
          steps: [],
          bootstrap: {},
        },
      };
      const next = applyEvent(state, event);
      expect(next.phase).toBe('failed');
    });

    it('stores the result', () => {
      const state = createInitialState();
      const result = { success: true, aborted: false, steps: [], bootstrap: {} };
      const next = applyEvent(state, { type: 'run-complete', result });
      expect(next.result).toEqual(result);
    });
  });

  describe('EVENT action — run-error', () => {
    it('transitions to failed phase', () => {
      const state = createInitialState();
      const next = applyEvent(state, { type: 'run-error', message: 'Something exploded' });
      expect(next.phase).toBe('failed');
    });

    it('stores the error message in errorMessage', () => {
      const state = createInitialState();
      const next = applyEvent(state, { type: 'run-error', message: 'boom' });
      expect(next.errorMessage).toBe('boom');
    });
  });
});
