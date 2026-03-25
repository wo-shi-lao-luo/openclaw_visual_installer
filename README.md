# OpenClaw Visual Installer

A Windows GUI installer for [OpenClaw](https://openclaw.ai), built with Electron + TypeScript + React.

Lets Windows users install OpenClaw through a step-by-step interface without touching the terminal. Runs OpenClaw inside WSL (Windows Subsystem for Linux).

> **Status:** Phase 1 complete — environment check, install flow, and full wizard UI. See [TASKS.md](./TASKS.md) for roadmap.

---

## Requirements

**To run the installer (end users):**
- Windows 10 Build 19041 (version 2004) or later, or Windows 11
- WSL2 with Ubuntu

**To develop:**
- Node.js 22+
- WSL2 (for running the installer logic during development)
- WSLg (for rendering the Electron window from WSL)

---

## Getting Started

```bash
git clone <repo>
cd openclaw-visual-installer
npm install
npm run dev
```

The installer window will open via WSLg.

---

## What it does

1. **Checks your environment** — Windows version, WSL availability, Ubuntu distro
2. **Guides you through missing prerequisites** — with auto-resolve or manual instructions
3. **Installs OpenClaw** — runs the official install script inside WSL Ubuntu
4. **Verifies the installation** — confirms the `openclaw` binary is available

---

## Project Structure

```
project-manager/    Product requirements (PRD)
architecture/       ADRs and system design
implementation/     Application source code
  src/
    main/           Electron main process
      environment/  Windows & WSL checks
      installer/    Install orchestration
      ipc/          IPC handlers
    preload/        Renderer ↔ main bridge
    renderer/       React UI
      pages/        Wizard pages
      store/        Zustand state machine
tests/              Unit tests (vitest)
scripts/            Build and packaging helpers
assets/             Icons and static resources
```

---

## Development

```bash
npm run dev        # Start with hot reload
npm test           # Run unit tests
npm run typecheck  # TypeScript check
npm run build      # Production build
```

---

## Architecture

Five-layer architecture: UI Flow → Environment Assessment → Installation Orchestration → Validation & Recovery → Diagnostics.

See [`architecture/`](./architecture/) for ADRs and [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for the full system design.

---

## Contributing

This is an open source project. Contributions welcome.

- Follow the development workflow in [CLAUDE.md](./CLAUDE.md)
- All new features require tests (80%+ coverage)
- Run `npm test` and `npm run typecheck` before submitting a PR
