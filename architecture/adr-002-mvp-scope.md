---
name: ADR-002 MVP Product Decisions
owner_role: Architect
created: 2026-03-25
updated: 2026-03-25
status: Accepted
---

# ADR-002: MVP Product Decisions

## Status
Accepted

## Decisions

### 1. OpenClaw Install Method
**Official curl script.**
The installer will execute OpenClaw's official curl installation script inside the WSL distro.
Verification signal (specific port/URL to check for accessibility) to be confirmed when the curl script is examined at implementation start.

### 2. Recommended Distro
**Ubuntu** (latest LTS available via `wsl --install`).
MVP supports one distro only. Ubuntu is the default `wsl --install` target and requires no special configuration.

### 3. Minimum Windows Version
**Windows 10 Build 19041 (version 2004) or later, plus Windows 11.**
This is the minimum build where WSL2 is natively supported without manual kernel update.
The environment check layer must gate on this build number.

### 4. WSL Prerequisite Handling
**User choice.** For steps that require admin privileges or a system restart (e.g., enabling the WSL Windows feature), the installer presents two options:
- "Handle automatically" — installer runs the required command with elevation
- "I'll do it myself" — installer provides the exact step to follow and waits for confirmation

This avoids surprising users with silent elevation while still offering a fast path.

### 5. MVP Scope
**Install only.** MVP covers:
- Environment detection and prerequisite guidance
- OpenClaw installation via curl script
- First-launch and accessibility verification
- Basic post-install control (start, stop, restart, open entry point, view logs, repair entry)

**Excluded from MVP:**
- Upgrade path (version management)
- Anonymous telemetry
- Multi-distro support

### 6. E2E Verification
**Manual for MVP.** Automated E2E tests (Playwright) are deferred. All five PRD scenarios (A–E) will be manually verified by the maintainer during development.
Automated E2E coverage is a Phase 2 addition.

## Open Items

- Exact port/URL that OpenClaw exposes for accessibility verification — to be confirmed from curl script
- Whether "Ubuntu" means a specific LTS version (22.04 vs 24.04) — default to whatever `wsl --install` provides; can pin later
