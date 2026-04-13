# Windows Native Installer Architecture

## Summary

This area defines the native Windows installer for OpenClaw. The first phase is a native Windows scaffold that establishes the product boundary, shell entry point, and orchestration shape for future Windows-native work.

## Architecture intent

The Windows product area should be able to stand on its own as a separate installer surface from the legacy WSL-first implementation.

The first phase keeps the implementation framework-agnostic and focuses on the shape of the app rather than a final runtime choice.

## Phase 1 responsibilities

- detect the local Windows environment
- present a minimal installer shell UI
- coordinate installer steps through a small orchestrator layer
- perform a real local filesystem install into a user-writable directory
- track validation outcomes and installation state
- emit diagnostics and logs in a simple, extensible way

## Phase 1 boundaries

The architecture should not assume:

- a final Electron or Tauri decision
- network-based installation or remote package fetches
- repair, rollback, or recovery systems
- WSL-based execution as the primary path
- multi-node or remote management features

## Suggested structure

- `docs/` for requirements, scope, design notes, and decision records
- `src/` for the shell and installer code
- `tests/` for validation and behavior coverage
- `scripts/` for automation helpers, when needed
- `assets/` for Windows-specific static resources, when needed

## Implementation shape

The initial implementation should be easy to find:

- `src/index.ts` as the top-level entry point
- `src/shell/` for the installer UI shell
- `src/installer/` for orchestration and step coordination
- `src/environment/` for Windows checks and detection
- `src/diagnostics/` for logging and support output

## Decision note

The shell host choice is pending. Keep the code and docs flexible until the product direction requires a final Electron or Tauri selection.
