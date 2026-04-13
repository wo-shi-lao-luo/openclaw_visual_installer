# OpenClaw Windows Installer

This folder is the self-contained Windows-native product area for OpenClaw.
It is framework-agnostic for now and intentionally separate from the legacy WSL area in `../WSL/`.

## Package shape

- package name: `openclaw-windows-installer`
- canonical entry point: `src/index.ts`
- build command: `npm run build`
- start command: `npm start`
- MVP command: `npm run mvp:auto`
- test command: `npm test`
- watch mode: `npm run test:watch`
- typecheck command: `npm run typecheck`

## MVP scope

Phase 1 now performs a real local install:

- environment checks
- shell model assembly
- phase-one installer orchestration
- diagnostics and logging helpers
- a small, testable bootstrap surface
- a concrete filesystem install into a user-writable directory
- a manifest and launcher for the installed payload

## What is intentionally pending

- final shell host selection such as Electron or Tauri
- packaging and distribution mechanics
- install, repair, rollback, or recovery automation
- deeper WSL integration

## Project layout

- `src/index.ts` — canonical bootstrap and package entry point
- `src/environment/` — Windows environment checks
- `src/shell/` — shell state/model assembly
- `src/installer/` — phase-one orchestration
- `src/diagnostics/` — diagnostics and logging helpers
- `tests/` — Vitest coverage for the Phase 1 scaffold
- `docs/` — architecture and planning docs

## Quick start

From this folder:

```bash
npm install
npm run build
npm run mvp:auto
npm run mvp:uninstall
npm test
npm run typecheck
```

The codebase is intentionally lightweight and pure TypeScript so it can be validated on its own before a runtime host is chosen.
