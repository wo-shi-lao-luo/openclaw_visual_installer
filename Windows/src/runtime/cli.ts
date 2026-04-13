import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

import { runInstallerMvp, runInstallerMvpUninstall } from './installer-mvp.js';

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function readValue(prefix: string): string | undefined {
  const explicit = process.argv.find((argument) => argument.startsWith(prefix));

  if (!explicit) {
    return undefined;
  }

  return explicit.slice(prefix.length);
}

function readPlatformOverride(): NodeJS.Platform | undefined {
  const raw = readValue('--platform=');
  return raw ? (raw as NodeJS.Platform) : undefined;
}

function readInstallRootOverride(): string | undefined {
  return readValue('--install-root=');
}

function readPayloadRootOverride(): string | undefined {
  return readValue('--payload-root=');
}

async function main() {
  const autoConfirm = hasFlag('--auto');
  const uninstall = hasFlag('--uninstall');
  const platform = readPlatformOverride();
  const installRoot = readInstallRootOverride();
  const payloadRoot = readPayloadRootOverride();
  const rl = createInterface({ input: stdin, output: stdout });

  try {
    const io = {
      writeLine: (line: string) => {
        stdout.write(`${line}\n`);
      },
      prompt: async (question: string) => {
        const answer = await rl.question(`${question} [y/N] `);
        return /^y(es)?$/i.test(answer.trim());
      },
    };

    const result = uninstall
      ? await runInstallerMvpUninstall(io, {
          autoConfirm,
          bootstrapOptions: platform ? { platform } : undefined,
          installOptions: {
            installRoot,
            payloadRoot,
          },
        })
      : await runInstallerMvp(io, {
          autoConfirm,
          bootstrapOptions: platform ? { platform } : undefined,
          installOptions: {
            installRoot,
            payloadRoot,
          },
        });

    if (!result.success) {
      process.exitCode = 1;
    }
  } finally {
    rl.close();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  stdout.write(`Installer MVP failed: ${message}\n`);
  process.exitCode = 1;
});
