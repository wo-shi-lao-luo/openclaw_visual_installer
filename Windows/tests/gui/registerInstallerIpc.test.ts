import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { IPC_CHANNEL_COMMAND, IPC_CHANNEL_EVENT } from '../../gui/shared/ipc-contract.js';

// ── Minimal stubs for Electron ipcMain ───────────────────────────────────────

type Handler = (event: unknown, payload: unknown) => Promise<unknown>;
const handlers = new Map<string, Handler>();

// NOTE: vi.mock is hoisted by vitest, so the factory must not reference
// variables declared in the outer scope. We use module-level Maps instead.
vi.mock('electron', () => {
  return {
    ipcMain: {
      handle: vi.fn((channel: string, fn: Handler) => { handlers.set(channel, fn); }),
      removeHandler: vi.fn((channel: string) => { handlers.delete(channel); }),
    },
  };
});

// Retrieve the mocked ipcMain after the mock is set up
import { ipcMain as ipcMainStub } from 'electron';

// ── Import after mock ─────────────────────────────────────────────────────────

import { registerInstallerIpc } from '../../gui/main/ipc/registerInstallerIpc.js';
import type { InstallerMvpRunResult } from '../../src/runtime/installer-mvp.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeWebContents() {
  return { send: vi.fn(), isDestroyed: () => false };
}

function makeWindow(wc = makeWebContents()) {
  return { webContents: wc, isDestroyed: () => false } as any;
}

async function invokeCommand(payload: unknown) {
  const handler = handlers.get(IPC_CHANNEL_COMMAND);
  if (!handler) throw new Error('No handler registered');
  return handler({}, payload);
}

function makeSuccessResult(): InstallerMvpRunResult {
  return {
    success: true,
    aborted: false,
    bootstrap: {} as any,
    steps: [],
    openClawInstallResult: { success: true, exitCode: 0, stdout: '', stderr: '', message: 'ok' },
    openClawVerifyResult: { cliFound: true, cliPath: 'openclaw', gatewayReachable: false, message: 'found' },
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('registerInstallerIpc', () => {
  afterEach(() => {
    (ipcMainStub.handle as ReturnType<typeof vi.fn>).mockClear();
    (ipcMainStub.removeHandler as ReturnType<typeof vi.fn>).mockClear();
    handlers.clear();
  });

  it('registers a handler for installer:invoke on setup', () => {
    const win = makeWindow();
    const cleanup = registerInstallerIpc(() => win);
    expect(ipcMainStub.handle).toHaveBeenCalledWith(IPC_CHANNEL_COMMAND, expect.any(Function));
    cleanup();
  });

  it('cleanup removes the handler', () => {
    const win = makeWindow();
    const cleanup = registerInstallerIpc(() => win);
    cleanup();
    expect(ipcMainStub.removeHandler).toHaveBeenCalledWith(IPC_CHANNEL_COMMAND);
  });

  it('returns error for unknown command type', async () => {
    const win = makeWindow();
    const cleanup = registerInstallerIpc(() => win);
    const result = await invokeCommand({ type: 'explode-everything' });
    expect((result as any).error).toBeDefined();
    cleanup();
  });

  it('start command triggers run and sends run-complete event', async () => {
    const wc = makeWebContents();
    const win = makeWindow(wc);

    const mockRun = vi.fn().mockResolvedValue(makeSuccessResult());
    const cleanup = registerInstallerIpc(() => win, { runInstallerMvp: mockRun });

    await invokeCommand({ type: 'start', mode: 'install' });

    // Allow the async run to complete
    await new Promise((r) => setTimeout(r, 10));

    const sentEvents = wc.send.mock.calls.map((args: any[]) => ({ ch: args[0], ev: args[1] }));
    const completeEvent = sentEvents.find((e) => e.ev?.type === 'run-complete');
    expect(completeEvent).toBeDefined();
    expect(completeEvent!.ev.result.success).toBe(true);
    cleanup();
  });

  it('start command sends run-error event when installer throws', async () => {
    const wc = makeWebContents();
    const win = makeWindow(wc);

    const mockRun = vi.fn().mockRejectedValue(new Error('PowerShell exploded'));
    const cleanup = registerInstallerIpc(() => win, { runInstallerMvp: mockRun });

    await invokeCommand({ type: 'start', mode: 'install' });
    await new Promise((r) => setTimeout(r, 10));

    const errorEvent = wc.send.mock.calls.find((args: any[]) => args[1]?.type === 'run-error');
    expect(errorEvent).toBeDefined();
    expect(errorEvent![1].message).toContain('PowerShell exploded');
    cleanup();
  });

  it('second start while running returns error without re-running', async () => {
    const wc = makeWebContents();
    const win = makeWindow(wc);

    let resolveRun!: (v: InstallerMvpRunResult) => void;
    const hangingRun = new Promise<InstallerMvpRunResult>((r) => { resolveRun = r; });
    const mockRun = vi.fn().mockReturnValue(hangingRun);
    const cleanup = registerInstallerIpc(() => win, { runInstallerMvp: mockRun });

    await invokeCommand({ type: 'start', mode: 'install' });
    const secondResult = await invokeCommand({ type: 'start', mode: 'install' });

    expect((secondResult as any).error).toContain('already in progress');
    expect(mockRun).toHaveBeenCalledOnce();

    resolveRun(makeSuccessResult());
    cleanup();
  });

  it('confirm-response resolves the pending prompt', async () => {
    const wc = makeWebContents();
    const win = makeWindow(wc);

    const mockRun = vi.fn().mockImplementation(async (io: any) => {
      const confirmed = await io.prompt('Install?');
      return { ...makeSuccessResult(), success: confirmed };
    });

    const cleanup = registerInstallerIpc(() => win, { runInstallerMvp: mockRun });

    await invokeCommand({ type: 'start', mode: 'install' });
    // Give the async run a tick to hit the io.prompt() call and send the event
    await new Promise((r) => setTimeout(r, 20));

    // Find the prompt event id from wc.send calls
    const promptCall = wc.send.mock.calls.find((args: any[]) => args[1]?.type === 'prompt');
    expect(promptCall).toBeDefined();
    const promptId: string = promptCall![1].id;

    await invokeCommand({ type: 'confirm-response', id: promptId, confirmed: true });
    await new Promise((r) => setTimeout(r, 20));

    const completeEvent = wc.send.mock.calls.find((args: any[]) => args[1]?.type === 'run-complete');
    expect(completeEvent).toBeDefined();
    cleanup();
  });
});
