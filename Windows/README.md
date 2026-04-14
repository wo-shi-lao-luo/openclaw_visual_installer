# OpenClaw Windows Installer

This folder is the self-contained Windows-native product area for OpenClaw.
It is framework-agnostic for now and intentionally separate from the legacy WSL area in `../WSL/`.

**Minimum requirement: Windows 10 1809 (October 2018 Update) or later.**

## Package shape

- package name: `openclaw-windows-installer`
- canonical entry point: `src/index.ts`
- build command: `npm run build`
- installer exe command: `npm run build:exe` → `dist/OpenClawInstaller.exe`
- start command: `npm start`
- MVP command: `npm run mvp:auto`
- test command: `npm test`
- watch mode: `npm run test:watch`
- typecheck command: `npm run typecheck`

## What the installer does (Phase 2)

The built `OpenClawInstaller.exe` runs a full end-to-end install without WSL or admin rights:

1. **Environment check** — confirms the host is Windows
2. **Validate** — prompts the user to confirm before changing anything
3. **Install** — single PowerShell session:
   - Sets execution policy to `RemoteSigned` (CurrentUser) so npm `.ps1` wrappers can run
   - Ensures Node.js 22 LTS is available: checks PATH → tries winget → falls back to direct zip download into `%LOCALAPPDATA%\Programs\nodejs`
   - Adds npm global bin to the persistent user PATH registry entry
   - Runs the OpenClaw install script: `iwr -useb https://openclaw.ai/install.ps1`
4. **Verify** — runs `where.exe openclaw` to confirm the CLI is on PATH
5. **Finalize** — writes a manifest and launcher to `%LOCALAPPDATA%\OpenClaw\`

The install script URL and platform-specific commands are documented at https://docs.openclaw.ai/install.

## Project layout

- `src/index.ts` — canonical package entry point and public API
- `src/environment/` — Windows environment detection
- `src/shell/` — shell state/model assembly
- `src/installer/` — phase-one step orchestration
- `src/openclaw/` — install and verify logic (PowerShell-based)
- `src/powershell/` — generic PowerShell/process runner with injectable SpawnFn
- `src/runtime/` — MVP runner and filesystem install/uninstall
- `src/diagnostics/` — diagnostics and logging helpers
- `tests/` — Vitest coverage (43 tests, all passing)
- `docs/` — architecture and planning docs
- `launcher/` — CJS launcher entry point for pkg bundling

## Quick start

From this folder:

```bash
npm install
npm run build
npm run mvp:auto      # run the installer CLI in auto-confirm mode
npm run mvp:uninstall # remove the local installer record
npm test
npm run typecheck
```

To build the standalone `.exe`:

```bash
npm run build:exe
# → dist/OpenClawInstaller.exe (≈36 MB, no Node.js required on target machine)
```

To run and capture output in PowerShell (useful for debugging):

```powershell
.\dist\OpenClawInstaller.exe | Tee-Object -FilePath install.log
```

## Key technical decisions

- **CJS output (not ESM)** — `pkg` does not support dynamic ESM `import()`. `tsconfig.build.json` overrides `module` to `CommonJS`.
- **`readFile` + `writeFile` instead of `copyFile`** — `pkg` uses a virtual snapshot filesystem; OS-level `CopyFileW` fails across the boundary.
- **Single PowerShell session for install** — PATH changes from Node.js install are visible when openclaw's install.ps1 runs.
- **No WSL dependency** — uses PowerShell and `where.exe` natively.

## Pending (Phase 3+)

- Electron or Tauri GUI shell
- NSIS packaging and code-signing for distribution
- Repair and rollback flows
