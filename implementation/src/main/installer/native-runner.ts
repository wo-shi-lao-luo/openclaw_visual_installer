import { spawn } from 'child_process'
import type { CommandRunner, CommandResult } from './types'

/**
 * Runs a command on the Windows host shell (cmd.exe).
 * Used for native Windows installation via npm.
 *
 * On non-Windows platforms this runner returns a clear error rather than
 * attempting to spawn a Windows shell that is not present.
 */
export const createNativeRunner = (): CommandRunner => {
  return (command: string): Promise<CommandResult> => {
    if (process.platform !== 'win32') {
      return Promise.resolve({
        stdout: '',
        stderr: 'Native Windows installation is only available on Windows.',
        exitCode: 1
      })
    }

    return new Promise((resolve) => {
      const proc = spawn('cmd.exe', ['/d', '/s', '/c', command], {
        windowsHide: true,
        shell: false
      })

      let stdout = ''
      let stderr = ''

      proc.stdout.on('data', (chunk: Buffer) => { stdout += chunk.toString() })
      proc.stderr.on('data', (chunk: Buffer) => { stderr += chunk.toString() })

      proc.on('close', (exitCode) => {
        resolve({ stdout: stdout.trim(), stderr: stderr.trim(), exitCode: exitCode ?? 1 })
      })

      proc.on('error', (err) => {
        resolve({ stdout: '', stderr: err.message, exitCode: 1 })
      })
    })
  }
}
