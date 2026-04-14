import { spawn as nodeSpawn, type SpawnOptions } from 'node:child_process';
import { EventEmitter } from 'node:events';

export type SpawnFn = (
  command: string,
  args: string[],
  options: SpawnOptions,
) => ReturnType<typeof nodeSpawn>;

export interface PsCommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  success: boolean;
}

export interface PsCommandOptions {
  onStdoutLine?: (line: string) => void;
  onStderrLine?: (line: string) => void;
  timeoutMs?: number;
  spawnFn?: SpawnFn;
}

function flushLines(buffer: string, onLine: (line: string) => void): string {
  const lines = buffer.split('\n');
  const remaining = lines.pop() ?? '';
  for (const line of lines) {
    onLine(line);
  }
  return remaining;
}

export async function runPowerShellCommand(
  command: string,
  options: PsCommandOptions = {},
): Promise<PsCommandResult> {
  const spawnFn = options.spawnFn ?? nodeSpawn;
  const args = ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', command];

  return new Promise((resolve, reject) => {
    const child = spawnFn('powershell.exe', args, { stdio: 'pipe', windowsHide: true });

    const stdoutChunks: string[] = [];
    const stderrChunks: string[] = [];
    let stdoutLineBuffer = '';
    let stderrLineBuffer = '';

    (child.stdout as EventEmitter).on('data', (chunk: Buffer) => {
      const text = chunk.toString('utf8');
      stdoutChunks.push(text);
      if (options.onStdoutLine) {
        stdoutLineBuffer += text;
        stdoutLineBuffer = flushLines(stdoutLineBuffer, options.onStdoutLine);
      }
    });

    (child.stderr as EventEmitter).on('data', (chunk: Buffer) => {
      const text = chunk.toString('utf8');
      stderrChunks.push(text);
      if (options.onStderrLine) {
        stderrLineBuffer += text;
        stderrLineBuffer = flushLines(stderrLineBuffer, options.onStderrLine);
      }
    });

    let timer: ReturnType<typeof setTimeout> | undefined;
    if (options.timeoutMs !== undefined) {
      timer = setTimeout(() => {
        child.kill();
        reject(new Error(`PowerShell command timed out after ${options.timeoutMs}ms`));
      }, options.timeoutMs);
    }

    child.on('error', (err: Error) => {
      clearTimeout(timer);
      reject(err);
    });

    child.on('close', (code: number | null) => {
      clearTimeout(timer);
      if (stdoutLineBuffer.trim() && options.onStdoutLine) options.onStdoutLine(stdoutLineBuffer);
      if (stderrLineBuffer.trim() && options.onStderrLine) options.onStderrLine(stderrLineBuffer);
      const exitCode = code ?? 1;
      resolve({
        exitCode,
        stdout: stdoutChunks.join(''),
        stderr: stderrChunks.join(''),
        success: exitCode === 0,
      });
    });
  });
}

/** Run a plain executable (not PowerShell) and return its output. */
export async function runProcess(
  executable: string,
  args: string[],
  options: Pick<PsCommandOptions, 'timeoutMs' | 'spawnFn'> = {},
): Promise<PsCommandResult> {
  const spawnFn = options.spawnFn ?? nodeSpawn;

  return new Promise((resolve, reject) => {
    const child = spawnFn(executable, args, { stdio: 'pipe', windowsHide: true });

    const stdoutChunks: string[] = [];
    const stderrChunks: string[] = [];

    (child.stdout as EventEmitter).on('data', (chunk: Buffer) => stdoutChunks.push(chunk.toString('utf8')));
    (child.stderr as EventEmitter).on('data', (chunk: Buffer) => stderrChunks.push(chunk.toString('utf8')));

    let timer: ReturnType<typeof setTimeout> | undefined;
    if (options.timeoutMs !== undefined) {
      timer = setTimeout(() => { child.kill(); reject(new Error(`Process timed out: ${executable}`)); }, options.timeoutMs);
    }

    child.on('error', (err: Error) => { clearTimeout(timer); reject(err); });
    child.on('close', (code: number | null) => {
      clearTimeout(timer);
      const exitCode = code ?? 1;
      resolve({ exitCode, stdout: stdoutChunks.join(''), stderr: stderrChunks.join(''), success: exitCode === 0 });
    });
  });
}
