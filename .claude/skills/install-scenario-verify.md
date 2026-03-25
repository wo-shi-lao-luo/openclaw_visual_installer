---
name: install-scenario-verify
description: Verify code changes against all five OpenClaw installer scenarios (A–E) from the PRD. Run after any change to install path, environment check, or validation logic.
---

# Installer Scenario Verification

Run this skill after any change touching: environment assessment, installation orchestration, validation/recovery, or the UI flow layer.

## Scenario Checklist

For each scenario, answer: does the current implementation handle this correctly?

### Scenario A — No WSL installed
- [ ] WSL absence is detected and classified (not silently failing)
- [ ] User receives human-readable explanation, not a raw error
- [ ] Guided path to resolve prerequisite is provided
- [ ] After prerequisite resolved, install proceeds correctly

### Scenario B — WSL present, OpenClaw not installed
- [ ] Available WSL environment is detected correctly
- [ ] Recommended distro check passes or provides clear guidance
- [ ] Install completes
- [ ] Launch validation confirms usability (not just process presence)
- [ ] Local entry point is surfaced to user

### Scenario C — OpenClaw already installed
- [ ] Existing installation is detected before any action
- [ ] User is informed of current state before any modification
- [ ] Destructive action (overwrite/reinstall/reset) requires explicit confirmation
- [ ] Repair/reuse path is available where applicable

### Scenario D — Installation failure
- [ ] Failure is captured with step context
- [ ] Failure is classified (env/permission/WSL/distro/install/launch/port/resource)
- [ ] User sees: what failed, why it likely failed, what to do next
- [ ] Retry, repair, or diagnostic export entry points are available
- [ ] "Unknown error" is NOT the default output

### Scenario E — Post-install control
- [ ] Installer correctly identifies already-installed state on relaunch
- [ ] Start, stop, restart, open entry point, view logs, and repair are all accessible
- [ ] Running state is shown accurately

## Verification Output

For each scenario: PASS / FAIL / NOT APPLICABLE

If any scenario FAILS, block the change and fix before proceeding.
If scenarios pass but coverage is below 80%, add tests before completing.
