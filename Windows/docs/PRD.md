# Windows Native Installer Phase 1 PRD

## Product

OpenClaw Windows Native Installer

## Goal

Let a Windows user install OpenClaw on Windows without needing npm, Node, or WSL installed first.

## Phase 1 objective

Deliver the smallest useful Windows-native installer skeleton that can:

- check the local environment
- guide the user through a simple shell UI flow
- orchestrate install steps through a placeholder pipeline
- surface validation placeholders
- capture diagnostics and logging placeholders

## Phase 1 includes

- entry screen / welcome state
- environment detection stubs
- basic support checks
- installation step orchestration scaffold
- success / failure states in the shell
- logging and diagnostics placeholders
- a clear source entry point in `Windows/src/`

## Explicitly out of scope

- packaging for release
- full runtime provisioning
- advanced repair flows
- automatic recovery/self-healing
- multi-node or fleet management
- deep WSL integration or migration tooling
- final Electron vs Tauri decision if it is not needed for the scaffold

## Success criteria for Phase 1

- The repository has a clear Windows product area separate from `WSL/`.
- A human can find where the Windows shell and installer logic will live.
- The scope is understandable without reading legacy WSL files.
- The folder contains `README.md`, `docs/`, `src/`, `tests/`, and supporting buckets as needed.
