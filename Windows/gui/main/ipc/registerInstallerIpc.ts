import { ipcMain, WebContents } from 'electron';
import type { BrowserWindow } from 'electron';
import {
  InstallerCommandSchema,
  IPC_CHANNEL_COMMAND,
  IPC_CHANNEL_EVENT,
} from '../../shared/ipc-contract.js';
import { createPromptRegistry } from './promptRegistry.js';
import { createRendererIo } from './createRendererIo.js';
import { serializeRunResult } from './serialize.js';

// Import installer logic from the compiled dist (resolved at runtime)
import {
  runInstallerMvp,
  runInstallerMvpUninstall,
} from '../../../src/runtime/installer-mvp.js';
import type {
  InstallerMvpRunResult,
  InstallerMvpStepState,
} from '../../../src/runtime/installer-mvp.js';

export interface RegisterInstallerIpcDeps {
  runInstallerMvp?: typeof runInstallerMvp;
  runInstallerMvpUninstall?: typeof runInstallerMvpUninstall;
}

/**
 * Registers ipcMain handlers for the installer:invoke channel.
 * Returns a cleanup function that removes the handlers (call on app quit).
 */
export function registerInstallerIpc(
  getWindow: () => BrowserWindow | null,
  deps: RegisterInstallerIpcDeps = {},
): () => void {
  const installFn = deps.runInstallerMvp ?? runInstallerMvp;
  const uninstallFn = deps.runInstallerMvpUninstall ?? runInstallerMvpUninstall;

  // Ensures only one install/uninstall run at a time
  let runLock = false;

  const promptRegistry = createPromptRegistry();

  function getWebContents(): WebContents | null {
    const win = getWindow();
    return win && !win.isDestroyed() ? win.webContents : null;
  }

  ipcMain.handle(IPC_CHANNEL_COMMAND, async (_event, rawPayload: unknown) => {
    const parseResult = InstallerCommandSchema.safeParse(rawPayload);
    if (!parseResult.success) {
      return { error: 'Invalid command payload', details: parseResult.error.message };
    }

    const command = parseResult.data;

    if (command.type === 'confirm-response') {
      promptRegistry.resolve(command.id, command.confirmed);
      return { ok: true };
    }

    if (command.type === 'cancel') {
      promptRegistry.rejectAll('User cancelled');
      return { ok: true };
    }

    if (command.type === 'start') {
      if (runLock) {
        return { error: 'An install is already in progress' };
      }

      runLock = true;

      // Fire-and-forget; results/errors are communicated via IPC events
      runInstallAsync(command.mode).finally(() => {
        runLock = false;
      });

      return { ok: true };
    }
  });

  async function runInstallAsync(mode: 'install' | 'uninstall'): Promise<void> {
    const wc = getWebContents();
    if (!wc) return;

    const io = createRendererIo(wc, promptRegistry);

    try {
      let result: InstallerMvpRunResult;

      const onStepChange = (step: Readonly<InstallerMvpStepState>) => {
        wc.send(IPC_CHANNEL_EVENT, {
          type: 'step-update',
          id: step.id,
          status: step.status,
          detail: step.detail,
        });
      };

      if (mode === 'uninstall') {
        result = await uninstallFn(io, { onStepChange });
      } else {
        result = await installFn(io, { onStepChange });
      }

      const serialized = serializeRunResult(result);
      wc.send(IPC_CHANNEL_EVENT, { type: 'run-complete', result: serialized });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      wc.send(IPC_CHANNEL_EVENT, { type: 'run-error', message });
    }
  }

  return () => {
    ipcMain.removeHandler(IPC_CHANNEL_COMMAND);
    promptRegistry.rejectAll('App closing');
  };
}
