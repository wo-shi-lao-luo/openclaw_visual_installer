import { describe, it, expect, vi } from 'vitest';
import { createRendererIo } from '../../gui/main/ipc/createRendererIo.js';
import { createPromptRegistry } from '../../gui/main/ipc/promptRegistry.js';

function makeWebContents() {
  return { send: vi.fn() };
}

describe('createRendererIo', () => {
  it('writeLine emits a log event to webContents', () => {
    const wc = makeWebContents();
    const registry = createPromptRegistry();
    const io = createRendererIo(wc as any, registry);

    io.writeLine('hello world');

    expect(wc.send).toHaveBeenCalledOnce();
    const [channel, event] = wc.send.mock.calls[0];
    expect(channel).toBe('installer:event');
    expect(event.type).toBe('log');
    expect(event.line).toBe('hello world');
    expect(event.stream).toBe('info');
  });

  it('writeLine emits separate events for separate lines', () => {
    const wc = makeWebContents();
    const registry = createPromptRegistry();
    const io = createRendererIo(wc as any, registry);

    io.writeLine('line 1');
    io.writeLine('line 2');

    expect(wc.send).toHaveBeenCalledTimes(2);
  });

  it('prompt emits a prompt event with a unique id and question', () => {
    const wc = makeWebContents();
    const registry = createPromptRegistry();
    const io = createRendererIo(wc as any, registry);

    // Start prompt (don't await — just check that event is emitted)
    const promptPromise = io.prompt('Install OpenClaw?');

    expect(wc.send).toHaveBeenCalledOnce();
    const [channel, event] = wc.send.mock.calls[0];
    expect(channel).toBe('installer:event');
    expect(event.type).toBe('prompt');
    expect(typeof event.id).toBe('string');
    expect(event.id.length).toBeGreaterThan(0);
    expect(event.question).toBe('Install OpenClaw?');

    // Resolve to avoid dangling promise
    registry.resolve(event.id, true);
    return promptPromise;
  });

  it('prompt resolves to true when registry resolves with true', async () => {
    const wc = makeWebContents();
    const registry = createPromptRegistry();
    const io = createRendererIo(wc as any, registry);

    const promptPromise = io.prompt('Continue?');
    const [, event] = wc.send.mock.calls[0];
    registry.resolve(event.id, true);
    await expect(promptPromise).resolves.toBe(true);
  });

  it('prompt resolves to false when registry resolves with false', async () => {
    const wc = makeWebContents();
    const registry = createPromptRegistry();
    const io = createRendererIo(wc as any, registry);

    const promptPromise = io.prompt('Continue?');
    const [, event] = wc.send.mock.calls[0];
    registry.resolve(event.id, false);
    await expect(promptPromise).resolves.toBe(false);
  });

  it('each prompt call uses a unique id', () => {
    const wc = makeWebContents();
    const registry = createPromptRegistry();
    const io = createRendererIo(wc as any, registry);

    const p1 = io.prompt('Q1');
    const p2 = io.prompt('Q2');

    const id1 = wc.send.mock.calls[0][1].id;
    const id2 = wc.send.mock.calls[1][1].id;
    expect(id1).not.toBe(id2);

    registry.resolve(id1, true);
    registry.resolve(id2, false);
    return Promise.all([p1, p2]);
  });
});
