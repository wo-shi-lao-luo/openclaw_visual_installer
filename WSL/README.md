# OpenClaw Visual Installer — WSL Legacy Area

Legacy WSL-first installer code for [OpenClaw](https://openclaw.ai), built with Electron + TypeScript + React.

This folder holds the existing Windows installer experience that runs OpenClaw inside WSL (Windows Subsystem for Linux). It is the legacy WSL product area only. New native Windows-focused work starts in `../Windows/`.

> **Status:** Legacy WSL product area only — environment check, install flow, and full wizard UI. See [docs/TASKS.md](./docs/TASKS.md) for roadmap.

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
README.md          Area overview and quick start
CLAUDE.md          Area-specific working instructions
docs/              PRD, architecture, ADRs, folder structure, tasks
src/               Application source code
  main/            Electron main process
    environment/    Windows & WSL checks
    installer/     Install orchestration
    ipc/            IPC handlers
  preload/         Renderer ↔ main bridge
  renderer/        React UI
    components/    UI components
    pages/         Wizard pages
    store/         Zustand state machine
tests/             Unit tests (vitest)
scripts/           Build and packaging helpers
assets/            Icons and static resources
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

See [`docs/`](./docs/) for PRD, architecture, ADRs, folder structure, and tasks. The main design docs are [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md), [`docs/PRD.md`](./docs/PRD.md), and the ADRs alongside them.

---

## Contributing

This is an open source project. Contributions welcome.

- Follow the development workflow in [CLAUDE.md](./CLAUDE.md)
- All new features require tests (80%+ coverage)
- Run `npm test` and `npm run typecheck` before submitting a PR
