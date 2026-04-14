import { runProcess, type SpawnFn } from '../powershell/ps-runner.js';

export interface OpenClawVerifyResult {
  cliFound: boolean;
  cliPath?: string;
  message: string;
}

export interface OpenClawVerifyOptions {
  spawnFn?: SpawnFn;
}

export async function verifyOpenClaw(options: OpenClawVerifyOptions = {}): Promise<OpenClawVerifyResult> {
  // Use where.exe to locate the openclaw binary on PATH (Windows native, no PowerShell needed)
  const whereResult = await runProcess('where.exe', ['openclaw'], {
    spawnFn: options.spawnFn,
    timeoutMs: 10_000,
  });

  if (!whereResult.success || whereResult.stdout.trim().length === 0) {
    return {
      cliFound: false,
      message: 'OpenClaw CLI not found on PATH. The install script may have failed or a shell restart is needed.',
    };
  }

  const cliPath = whereResult.stdout.trim().split('\n')[0]?.trim() ?? '';

  return {
    cliFound: true,
    cliPath,
    message: `OpenClaw CLI found at ${cliPath}.`,
  };
}
