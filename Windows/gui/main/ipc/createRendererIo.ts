import { randomUUID } from 'node:crypto';
import type { InstallerMvpIo } from '../../../src/runtime/installer-mvp.js';
import type { PromptRegistry } from './promptRegistry.js';
import { IPC_CHANNEL_EVENT } from '../../shared/ipc-contract.js';

export interface MinimalWebContents {
  send(channel: string, ...args: unknown[]): void;
}

/**
 * Builds an InstallerMvpIo that bridges the installer orchestrator to the
 * Electron renderer via IPC events. All log lines become `log` events;
 * user prompts emit a `prompt` event and park on a pending-promise entry in
 * the registry until the renderer responds.
 */
export function createRendererIo(
  webContents: MinimalWebContents,
  promptRegistry: PromptRegistry,
): InstallerMvpIo {
  function writeLine(line: string): void {
    webContents.send(IPC_CHANNEL_EVENT, { type: 'log', line, stream: 'info' });
  }

  async function prompt(question: string): Promise<boolean> {
    const id = randomUUID();
    const responsePromise = promptRegistry.register(id);
    webContents.send(IPC_CHANNEL_EVENT, { type: 'prompt', id, question });
    return responsePromise;
  }

  return { writeLine, prompt };
}
