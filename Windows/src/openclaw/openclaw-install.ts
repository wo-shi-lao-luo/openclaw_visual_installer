import { runPowerShellCommand, type SpawnFn } from '../powershell/ps-runner.js';

// See: https://docs.openclaw.ai/install
export const OPENCLAW_INSTALL_SCRIPT_URL = 'https://openclaw.ai/install.ps1';

// Node.js 22 LTS — minimum version required by OpenClaw
export const NODE_VERSION = '22.14.0';
export const NODE_DOWNLOAD_URL = `https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-win-x64.zip`;

export const OPENCLAW_INSTALL_TIMEOUT_MS = 600_000; // 10 minutes (includes potential Node.js download)

/**
 * Builds the PowerShell script that ensures Node.js is on PATH, then installs OpenClaw.
 * Runs as a single session so PATH changes from the Node.js install are visible to openclaw install.ps1.
 *
 * Node.js install strategy (no admin required):
 *   1. Check if node is already on PATH — done if so
 *   2. Try winget (built into Windows 10 1809+) with --scope user
 *   3. Fall back to downloading the zip from nodejs.org into %LOCALAPPDATA%\Programs\nodejs
 */
export function buildInstallCommand(): string {
  const ensureNode = `
$ErrorActionPreference = 'Stop'

# Allow local scripts to run (required for npm global packages like openclaw).
# RemoteSigned only affects the current user and is the standard dev-environment setting.
# The try/catch absorbs the harmless "overridden by a more specific scope" warning that
# PowerShell raises when the current process already has -ExecutionPolicy Bypass active.
try {
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
    Write-Host "[OK] PowerShell execution policy set to RemoteSigned (CurrentUser)"
} catch {
    Write-Host "[OK] Execution policy already permissive; RemoteSigned written to user profile"
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[*] Node.js not found. Installing..."
    $nodeInstalled = $false

    # --- attempt 1: winget ---
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        Write-Host "[*] Installing Node.js via winget..."
        winget install OpenJS.NodeJS.LTS \`
            --accept-source-agreements \`
            --accept-package-agreements \`
            --silent \`
            --scope user
        $env:PATH = [Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [Environment]::GetEnvironmentVariable("PATH","User")
        if (Get-Command node -ErrorAction SilentlyContinue) { $nodeInstalled = $true }
    }

    # --- attempt 2: direct zip download into %LOCALAPPDATA% (no admin required) ---
    if (-not $nodeInstalled) {
        $nodeVersion  = "${NODE_VERSION}"
        $nodeZipUrl   = "${NODE_DOWNLOAD_URL}"
        $nodeDir      = Join-Path $env:LOCALAPPDATA "Programs\\nodejs"
        $tmpZip       = Join-Path $env:TEMP "openclaw-node-$nodeVersion.zip"
        $extractDir   = Join-Path $env:TEMP "openclaw-node-extract"

        Write-Host "[*] Downloading Node.js $nodeVersion from nodejs.org..."
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri $nodeZipUrl -OutFile $tmpZip -UseBasicParsing

        Write-Host "[*] Extracting Node.js..."
        if (Test-Path $extractDir) { Remove-Item $extractDir -Recurse -Force }
        Expand-Archive -Path $tmpZip -DestinationPath $extractDir -Force

        $extracted = Get-ChildItem -Path $extractDir -Filter "node-v*-win-x64" -Directory | Select-Object -First 1
        if ($null -eq $extracted) {
            Write-Error "[!] Could not find extracted Node.js directory."
            exit 1
        }

        if (Test-Path $nodeDir) { Remove-Item $nodeDir -Recurse -Force }
        New-Item -ItemType Directory -Force -Path (Split-Path $nodeDir) | Out-Null
        Move-Item $extracted.FullName $nodeDir

        # Persist to user PATH
        $userPath = [Environment]::GetEnvironmentVariable("PATH", "User")
        if ($null -eq $userPath) { $userPath = "" }
        if ($userPath -notlike "*$nodeDir*") {
            [Environment]::SetEnvironmentVariable("PATH", "$nodeDir;$userPath", "User")
        }
        # Make available in this session immediately
        $env:PATH = "$nodeDir;" + $env:PATH

        if (Get-Command node -ErrorAction SilentlyContinue) { $nodeInstalled = $true }
    }

    if (-not $nodeInstalled) {
        Write-Error "[!] Failed to install Node.js automatically."
        Write-Error "    Please install Node.js 22+ manually: https://nodejs.org/en/download/"
        exit 1
    }

    Write-Host "[OK] Node.js ready: $(node --version)"
} else {
    Write-Host "[OK] Node.js already installed: $(node --version)"
}

# Ensure npm's global bin directory is in the persistent user PATH so openclaw
# remains reachable after the installer exits and the user opens a new shell.
$npmGlobalBin = (& npm prefix -g).Trim()
Write-Host "[*] npm global bin: $npmGlobalBin"
$currentUserPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if ($null -eq $currentUserPath) { $currentUserPath = "" }
if ($currentUserPath -notlike "*$npmGlobalBin*") {
    Write-Host "[*] Adding npm global bin to user PATH..."
    [Environment]::SetEnvironmentVariable("PATH", "$npmGlobalBin;$currentUserPath", "User")
}
$env:PATH = "$npmGlobalBin;" + $env:PATH
`.trimStart();

  const installOpenClaw =
    `& ([scriptblock]::Create((iwr -useb '${OPENCLAW_INSTALL_SCRIPT_URL}'))) -NoOnboard`;

  return `${ensureNode}\n${installOpenClaw}`;
}

export interface OpenClawInstallResult {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  message: string;
}

export interface OpenClawInstallOptions {
  onOutputLine?: (line: string) => void;
  timeoutMs?: number;
  spawnFn?: SpawnFn;
}

export async function installOpenClaw(options: OpenClawInstallOptions = {}): Promise<OpenClawInstallResult> {
  const result = await runPowerShellCommand(buildInstallCommand(), {
    onStdoutLine: options.onOutputLine,
    onStderrLine: options.onOutputLine,
    timeoutMs: options.timeoutMs ?? OPENCLAW_INSTALL_TIMEOUT_MS,
    spawnFn: options.spawnFn,
  });

  return {
    ...result,
    message: result.success
      ? 'OpenClaw installed successfully.'
      : `OpenClaw installation failed (exit code ${result.exitCode}).`,
  };
}
