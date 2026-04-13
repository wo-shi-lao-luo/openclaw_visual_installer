---
name: ADR-001 Tech Stack
owner_role: Architect
created: 2026-03-25
updated: 2026-03-25
status: Accepted
---

# ADR-001: Tech Stack

## Status
Accepted

## Context

This is a Windows GUI installer for OpenClaw targeting non-technical users. The project is open source and will distribute source first; packaged `.exe` distribution is deferred to a later phase.

Key forces:
- Open source project — contributor accessibility matters more than binary size at this stage
- TypeScript/JavaScript is more widely known than Rust, lowering barrier to contribution
- Complex multi-step wizard UI with real-time progress requires good frontend tooling
- WSL process interaction is required (launching `wsl.exe`, parsing output, managing distros)
- Admin elevation (UAC) required for WSL prerequisite steps
- Distribution size is not a priority constraint while running from source

## Decision

**Electron + TypeScript** for the application runtime.
**React + TypeScript** for the renderer (UI layer).
**Zustand** for installer state management (lightweight, TypeScript-first, fits the install session state machine).
**electron-vite** as the build tool (fast HMR, native TypeScript support, official recommendation).
**Playwright** for E2E testing when automated E2E coverage is added.

## Rationale

- Tauri (Rust) would produce a smaller binary but offers no meaningful advantage while running from source; the contributor accessibility tradeoff is not worth it at this stage
- React is the most common renderer choice and has full ECC tooling support (`typescript-reviewer`, `frontend-patterns`)
- Zustand maps cleanly to the `InstallState` enum defined in the architecture (not-installed / installing / installed / partial / failed / repairable)
- electron-vite is the current recommended Electron build tool and replaces the older webpack approach

## Consequences

**Positive:**
- Lower barrier for open source contributors
- Full ECC skill coverage: `everything-claude-code:typescript-reviewer`, `everything-claude-code:e2e`
- Mature ecosystem for wizard UIs and async process management

**Negative:**
- Packaged `.exe` will be ~80–120 MB when distribution is added later
- Chromium memory footprint during runtime

## Active ECC Skills

- Code review: `everything-claude-code:typescript-reviewer`
- E2E testing: `everything-claude-code:e2e`
- Frontend patterns: `everything-claude-code:frontend-patterns`
