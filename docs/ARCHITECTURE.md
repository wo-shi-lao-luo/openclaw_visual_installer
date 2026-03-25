---
name: ARCHITECTURE.md
owner_role: Architect
maintainers:
  - Architect
  - Project Manager
minimal: false
created: 2026-03-25
updated: 2026-03-25
---

# Architecture

## Problem Statement

Windows users need a reliable way to install OpenClaw without deep terminal knowledge. The installer must make the WSL path understandable, safe, recoverable, and supportable.

## Goals

- Complete the OpenClaw install journey on Windows through a GUI
- Minimize manual terminal interaction in the happy path
- Detect failure early and explain it clearly
- Support recovery, retry, and diagnostic export
- Keep the installer focused on setup rather than full runtime management

## Constraints and Assumptions

- MVP is WSL-first only
- MVP supports one recommended Linux distribution
- Existing OpenClaw installs must be detected and handled safely
- Success must be based on verified usability, not just process presence or exit codes
- The installer must stay separate from the future full management GUI

## System Boundary

### Inside the Installer
- Windows-facing UI flow
- Environment checks
- WSL preparation guidance
- Installation orchestration
- First-launch validation
- Basic control actions after install
- Logs, diagnostics, and repair entry points

### Outside the Installer
- Full OpenClaw management console
- Multi-node orchestration
- Plugin administration
- Arbitrary custom installation scripting
- Windows-native runtime mode

## Major Functional Areas

### 1. UI Flow Layer
Owns the visual journey:
- welcome
- environment check
- preparation
- confirmation
- execution
- success
- failure and recovery

This layer should always reflect the true state of the underlying installer pipeline.

### 2. Environment Assessment Layer
Determines:
- supported Windows version
- WSL availability and health
- WSL2 readiness
- recommended distro presence
- existing OpenClaw installation state
- obvious resource or port conflicts

Outputs should be structured and machine-readable internally, then rendered in user-friendly form.

### 3. Installation Orchestration Layer
Coordinates the install lifecycle:
- prepare prerequisites
- install or initialize OpenClaw in WSL
- validate the result
- record progress and failures

This layer should be idempotent where possible and preserve partial state for recovery.

### 4. Validation and Recovery Layer
Responsible for:
- first-launch checks
- accessibility verification
- repair detection
- retry and recovery decisions
- safe handling of existing installs

Validation should confirm actual usability, not just command success.

### 5. Diagnostics Layer
Collects and exports:
- environment summary
- step-by-step logs
- failure summary
- support-friendly diagnostic bundles

Sensitive data should be excluded by default.

## Key Workflows

### Fresh Install
1. Check Windows and WSL prerequisites
2. Guide the user through missing prerequisites
3. Prepare the recommended distro
4. Install OpenClaw
5. Validate launch and local access
6. Present success and entry point

### Existing Install
1. Detect existing OpenClaw state
2. Explain current condition and available paths
3. Offer repair, reuse, upgrade, or reinstall choices where supported
4. Require confirmation before destructive actions

### Failure Recovery
1. Record the failing step and context
2. Classify the failure cause
3. Present next-step guidance
4. Offer retry, repair, or diagnostics export

## Conceptual Data Model

- Installation Session
  - session id
  - timestamps
  - current stage
  - result status
- Environment Snapshot
  - Windows version
  - WSL state
  - distro state
  - detected conflicts
- Install State
  - not installed
  - installing
  - installed
  - partial
  - failed
  - repairable
- Diagnostic Bundle
  - environment summary
  - logs
  - failure summary
  - action history

## Integration Boundaries

The installer will likely need to interact with:
- Windows system capabilities for version and privilege checks
- WSL tooling for distro and runtime management
- Local process/service checks for OpenClaw availability
- File and log locations for diagnostics

These integrations should be behind clear internal boundaries so the UI remains decoupled from execution details.

## Non-Functional Considerations

### Reliability
- Prefer repeatable, predictable operations
- Preserve partial progress where safe
- Avoid brittle one-shot assumptions

### UX
- Use plain user-facing language
- Keep progress visible during long steps
- Minimize decision fatigue in the main path

### Supportability
- Capture step-aware logs
- Classify common failures consistently
- Make diagnostic export easy

### Security
- Avoid leaking sensitive data in logs
- Require confirmation for destructive actions
- Make privilege-requiring steps explicit

### Maintainability
- Keep product scope narrow
- Separate product intent from implementation detail
- Leave room for future reuse by a separate management GUI

## Technical Decisions and Tradeoffs

- WSL-first reduces support surface but narrows compatibility
- A single recommended distro simplifies guidance and support
- Strong verification improves trust but may increase implementation complexity
- Recovery-oriented design improves resilience but requires careful state modeling
- Diagnostics are essential for support but must be filtered for sensitivity

## Phased Implementation Guidance

### Phase 1: MVP Foundation
- environment detection
- UI flow skeleton
- install orchestration
- validation and failure states

### Phase 2: Recovery and Support
- repair paths
- diagnostic export
- richer failure classification

### Phase 3: Post-Install Operations
- start/stop/restart
- open local entry
- status and log viewing

## Risks and Open Questions

- Which Windows versions and build numbers are supported in MVP?
- Which distro is the recommended default?
- Which prerequisite steps can be automated safely?
- What is the best verification signal for success?
- How much of the repair path should be automated versus guided?
- How should the installer detect and handle pre-existing manual installs?
