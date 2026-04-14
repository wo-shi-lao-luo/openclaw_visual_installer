import { describe, it, expect } from 'vitest';
import {
  InstallerCommandSchema,
  InstallerEventSchema,
  StartCommandSchema,
  ConfirmResponseSchema,
  LogEventSchema,
  StepUpdateEventSchema,
  PromptEventSchema,
  RunCompleteEventSchema,
  RunErrorEventSchema,
} from '../../gui/shared/ipc-contract.js';

describe('InstallerCommandSchema', () => {
  it('accepts a valid start command', () => {
    const cmd = { type: 'start', mode: 'install' };
    expect(() => InstallerCommandSchema.parse(cmd)).not.toThrow();
  });

  it('accepts start with uninstall mode', () => {
    const cmd = { type: 'start', mode: 'uninstall' };
    expect(() => InstallerCommandSchema.parse(cmd)).not.toThrow();
  });

  it('accepts a confirm-response true', () => {
    const cmd = { type: 'confirm-response', id: 'abc-123', confirmed: true };
    expect(() => InstallerCommandSchema.parse(cmd)).not.toThrow();
  });

  it('accepts a confirm-response false', () => {
    const cmd = { type: 'confirm-response', id: 'abc-123', confirmed: false };
    expect(() => InstallerCommandSchema.parse(cmd)).not.toThrow();
  });

  it('rejects an unknown command type', () => {
    expect(() => InstallerCommandSchema.parse({ type: 'delete-everything' })).toThrow();
  });

  it('rejects start without mode', () => {
    expect(() => StartCommandSchema.parse({ type: 'start' })).toThrow();
  });

  it('rejects confirm-response without id', () => {
    expect(() => ConfirmResponseSchema.parse({ type: 'confirm-response', confirmed: true })).toThrow();
  });
});

describe('InstallerEventSchema', () => {
  it('accepts a log event', () => {
    const event = { type: 'log', line: 'Installing...', stream: 'stdout' };
    expect(() => InstallerEventSchema.parse(event)).not.toThrow();
  });

  it('accepts a log event with stderr stream', () => {
    const event = { type: 'log', line: 'Error!', stream: 'stderr' };
    expect(() => InstallerEventSchema.parse(event)).not.toThrow();
  });

  it('accepts a log event with info stream', () => {
    const event = { type: 'log', line: 'Step started', stream: 'info' };
    expect(() => InstallerEventSchema.parse(event)).not.toThrow();
  });

  it('rejects log without line', () => {
    expect(() => LogEventSchema.parse({ type: 'log', stream: 'stdout' })).toThrow();
  });

  it('accepts a step-update event', () => {
    const event = { type: 'step-update', id: 'install', status: 'running', detail: 'Installing OpenClaw' };
    expect(() => InstallerEventSchema.parse(event)).not.toThrow();
  });

  it('accepts a step-update without detail', () => {
    const event = { type: 'step-update', id: 'verify', status: 'completed' };
    expect(() => InstallerEventSchema.parse(event)).not.toThrow();
  });

  it('rejects step-update with invalid status', () => {
    expect(() =>
      StepUpdateEventSchema.parse({ type: 'step-update', id: 'install', status: 'exploded' })
    ).toThrow();
  });

  it('rejects step-update with invalid step id', () => {
    expect(() =>
      StepUpdateEventSchema.parse({ type: 'step-update', id: 'unknown-step', status: 'running' })
    ).toThrow();
  });

  it('accepts a prompt event', () => {
    const event = { type: 'prompt', id: 'p1', question: 'Install OpenClaw?' };
    expect(() => InstallerEventSchema.parse(event)).not.toThrow();
  });

  it('rejects prompt without question', () => {
    expect(() => PromptEventSchema.parse({ type: 'prompt', id: 'p1' })).toThrow();
  });

  it('accepts a run-complete event with success result', () => {
    const event = {
      type: 'run-complete',
      result: {
        success: true,
        aborted: false,
        steps: [],
        bootstrap: {} as unknown,
      },
    };
    expect(() => RunCompleteEventSchema.parse(event)).not.toThrow();
  });

  it('accepts a run-error event', () => {
    const event = { type: 'run-error', message: 'Something went wrong' };
    expect(() => InstallerEventSchema.parse(event)).not.toThrow();
  });

  it('rejects run-error without message', () => {
    expect(() => RunErrorEventSchema.parse({ type: 'run-error' })).toThrow();
  });

  it('rejects an unknown event type', () => {
    expect(() => InstallerEventSchema.parse({ type: 'teleport' })).toThrow();
  });
});
