# OpenClaw Visual Installer — Claude Instructions

## Project Overview

A Windows GUI installer for OpenClaw, WSL-first. Targets non-technical users on Windows.
See `docs/PRD.md` for full requirements and `docs/ARCHITECTURE.md` for system design.

## Repository Layout

```
project-manager/    PRD and product planning
architecture/       Technical design, ADRs, interface contracts
implementation/     Application source code
tests/              Unit, integration, E2E tests
scripts/            Build, packaging, diagnostics helpers
docs/               User/support-facing documentation
assets/             Icons, images, bundled resources
```

## System Design Summary

Five layers:
1. **UI Flow** — welcome → check → prepare → confirm → execute → success/failure
2. **Environment Assessment** — Windows version, WSL state, distro, conflicts
3. **Installation Orchestration** — idempotent install pipeline with progress recording
4. **Validation & Recovery** — accessibility verification (not just process presence), repair
5. **Diagnostics** — structured logs, failure classification, exportable bundles

## Critical Constraints

- Success is defined by **verified usability**, never by process presence or exit codes
- **No destructive action** without explicit user confirmation
- **No sensitive data** in logs by default
- Installer scope is strictly install/repair/control — NOT a full management GUI
- MVP: one recommended distro, WSL-first only

## Development Workflow

### Before any implementation
1. `/search-first` — search GitHub, docs, registries for existing patterns
2. `/blueprint` — turn objective into phased plan with risks identified

### For every feature
3. `/tdd-workflow` — write tests first (RED → GREEN → IMPROVE)
4. After writing code: use **code-reviewer** agent
5. For anything touching admin rights, destructive ops, or logs: `/security-review`

### For install path changes
6. `/verification-loop` — verify against PRD scenarios A–E
7. `/e2e-testing` — cover critical flows as E2E tests

### Architecture decisions
- Use `everything-claude-code:architecture-decision-records` to record all tech stack and design decisions in `architecture/`

## Tech Stack (TBD)

Not yet decided. Front-runner options:
- **Tauri (Rust + WebView2)** — lighter, native Windows integration, strong privilege model
- **Electron (TypeScript + Node.js)** — richer ecosystem, WSL via child_process

Once decided, activate the matching ECC review skill:
- Tauri/Rust → use `/everything-claude-code:rust-review` and `/everything-claude-code:rust-build`
- Electron/TypeScript → use `/everything-claude-code:typescript-reviewer`

## Installation Scenarios (must pass all)

- **Scenario A**: No WSL installed
- **Scenario B**: WSL present, OpenClaw absent
- **Scenario C**: OpenClaw already installed
- **Scenario D**: Installation failure
- **Scenario E**: Post-install control (start/stop/restart/logs/repair)

These are the acceptance criteria — every install path change must be verified against all five.

## Key Quality Rules

- Functions < 50 lines, files < 800 lines
- Immutable state patterns for install session/environment snapshot data
- 80%+ test coverage minimum
- All user inputs validated at system boundary
- No mutation of install state without explicit transition function

## Phase Reference

| Phase | Focus |
|-------|-------|
| 1 (MVP) | Environment detection, UI flow skeleton, install orchestration, validation |
| 2 | Repair paths, diagnostic export, richer failure classification |
| 3 | Start/stop/restart, status, log viewing |
