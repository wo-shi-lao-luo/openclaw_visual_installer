import { runProcess, runPowerShellCommand, type SpawnFn } from '../powershell/ps-runner.js';

// See: https://docs.openclaw.ai/install
export const OPENCLAW_GATEWAY_PORT = 18789;

export interface OpenClawVerifyResult {
  cliFound: boolean;
  cliPath?: string;
  gatewayReachable?: boolean;
  gatewayOutput?: string;
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

  const statusResult = await runPowerShellCommand('openclaw gateway status', {
    spawnFn: options.spawnFn,
    timeoutMs: 15_000,
  });

  return {
    cliFound: true,
    cliPath,
    gatewayReachable: statusResult.success,
    gatewayOutput: statusResult.stdout.trim() || undefined,
    message: `OpenClaw CLI found at ${cliPath}.${
      statusResult.success
        ? ` Gateway is reachable on port ${OPENCLAW_GATEWAY_PORT}.`
        : ' Gateway is not yet running.'
    }`,
  };
}
