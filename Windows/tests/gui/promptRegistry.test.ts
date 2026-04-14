import { describe, it, expect, vi } from 'vitest';
import { createPromptRegistry } from '../../gui/main/ipc/promptRegistry.js';

describe('createPromptRegistry', () => {
  it('creates a registry with register and resolve', () => {
    const registry = createPromptRegistry();
    expect(typeof registry.register).toBe('function');
    expect(typeof registry.resolve).toBe('function');
    expect(typeof registry.rejectAll).toBe('function');
  });

  it('register returns a promise that resolves when resolve is called with true', async () => {
    const registry = createPromptRegistry();
    const promise = registry.register('id-1');
    registry.resolve('id-1', true);
    await expect(promise).resolves.toBe(true);
  });

  it('register returns a promise that resolves when resolve is called with false', async () => {
    const registry = createPromptRegistry();
    const promise = registry.register('id-2');
    registry.resolve('id-2', false);
    await expect(promise).resolves.toBe(false);
  });

  it('resolve on unknown id does nothing (no throw)', () => {
    const registry = createPromptRegistry();
    expect(() => registry.resolve('nonexistent', true)).not.toThrow();
  });

  it('rejectAll rejects all pending promises', async () => {
    const registry = createPromptRegistry();
    const p1 = registry.register('id-a');
    const p2 = registry.register('id-b');
    registry.rejectAll('window closed');
    await expect(p1).rejects.toThrow('window closed');
    await expect(p2).rejects.toThrow('window closed');
  });

  it('rejectAll with no pending promises does not throw', () => {
    const registry = createPromptRegistry();
    expect(() => registry.rejectAll('gone')).not.toThrow();
  });

  it('register with duplicate id rejects the previous promise', async () => {
    const registry = createPromptRegistry();
    const first = registry.register('dup');
    const second = registry.register('dup');
    registry.resolve('dup', true);
    await expect(first).rejects.toThrow();
    await expect(second).resolves.toBe(true);
  });
});
