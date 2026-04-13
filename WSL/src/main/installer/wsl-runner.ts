import { spawn } from 'child_process'
import type { WslRunner, WslCommandResult } from './types'

/**
 * Runs a shell command inside the specified WSL distro (defaults to Ubuntu).
 * Returns stdout, stderr, and exit code as a structured result.
 */
export const createWslRunner = (distro = 'Ubuntu'): WslRunner => {
  return (command: string): Promise<WslCommandResult> => {
    return new Promise((resolve) => {
      const proc = spawn('wsl.exe', ['-d', distro, '--', 'bash', '-c', command], {
        windowsHide: true
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
