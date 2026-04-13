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
```
curl -fsSL https://openclaw.ai/install.sh | bash
```
Verification signal (specific port/URL to check for accessibility) to be confirmed from the install script output.

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

## Install Flow (confirmed)

1. `detect_existing` — `which openclaw`
2. `run_script` — `curl -fsSL https://openclaw.ai/install.sh | bash -s -- --no-onboard`
3. `verify_install` — `which openclaw`
4. `start_gateway` — `openclaw gateway start`
5. `verify_gateway` — `openclaw gateway status`

Gateway runs on port **18789** (loopback only by default).

Other useful commands confirmed:
- `openclaw configure` — interactive config wizard
- `openclaw doctor` — diagnostics
- `openclaw logs --follow` — log tailing
- `openclaw gateway stop / restart`

## Open Items

- Whether "Ubuntu" means a specific LTS version (22.04 vs 24.04) — default to whatever `wsl --install` provides; can pin later
- `openclaw configure` is required before `gateway start` succeeds — installer currently relies on the user completing config before clicking Install. Phase 2 may add guided config flow.
