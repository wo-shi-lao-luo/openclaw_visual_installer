# Windows Source

This folder is the conventional `src/` tree for the native Windows product area.
It stays framework-agnostic for Phase 1 and keeps the shell host choice pending.

## Current module flow

- `src/index.ts` — canonical bootstrap and package entry point
- `src/main.ts` — legacy compatibility shim that re-exports `src/index.ts`
- `src/shared/types.ts` — shared Windows installer domain types
- `src/environment/` — environment and support checks
- `src/shell/` — app shell view-state / model assembly
- `src/installer/` — phase-one orchestration and plan state
- `src/diagnostics/` — structured diagnostics and logging helpers

## Phase 1 shape

The Windows MVP is intentionally small and conventional, but it now performs a tangible install:

- bootstrap the Windows installer from a single entry point
- derive a typed shell model from environment status
- build a phase-one plan instead of a raw step list
- return structured environment checks with notes and diagnostic events
- copy the built runnable payload into a local install root
- write a manifest and launcher into the install root
- keep diagnostics lightweight and extensible

## Install behavior

- default install root: `%LOCALAPPDATA%/OpenClaw/WindowsInstallerMVP`
- payload copied under `dist/` inside the install root
- launcher written as `OpenClaw.WindowsInstallerMVP.cmd`
- manifest written as `install-manifest.json`
- uninstall supported through the CLI `--uninstall` flag

## Intentionally pending

- a final shell host decision such as Electron or Tauri
- packaging and distribution workflow
- deep recovery, rollback, or repair flows
