---
name: installer-phase
description: Plan and implement a single installer phase (environment check, orchestration, validation, or diagnostics) following the OpenClaw installer architecture.
---

# Installer Phase Implementation

You are implementing a component for the OpenClaw Visual Installer. Follow this workflow exactly.

## Step 1 — Identify the layer

Confirm which architectural layer this work belongs to:
- **UI Flow** (visual states, page transitions)
- **Environment Assessment** (checks, structured output)
- **Installation Orchestration** (pipeline steps, idempotency)
- **Validation & Recovery** (accessibility checks, repair)
- **Diagnostics** (log collection, export)

## Step 2 — Check constraints

Before writing any code, verify:
- [ ] Does this touch admin/privilege operations? → trigger security review
- [ ] Does this modify install state? → must use explicit state transition, not mutation
- [ ] Does this produce user-visible output? → must use plain language, not raw command output
- [ ] Does this claim success? → success requires verified usability, not exit code

## Step 3 — Define acceptance against PRD scenarios

Map your work to which scenarios it must not break:
- A: No WSL
- B: WSL present, no OpenClaw
- C: OpenClaw already installed
- D: Failure path
- E: Post-install control

## Step 4 — TDD

1. Write failing tests that cover your acceptance criteria
2. Run tests — confirm RED
3. Implement minimum code to pass
4. Run tests — confirm GREEN
5. Refactor for clarity and immutability
6. Confirm 80%+ coverage

## Step 5 — Review checklist

- [ ] No raw command output exposed to UI
- [ ] No mutation of shared state
- [ ] Failure case returns classified error with next-step guidance
- [ ] Destructive operations require confirmation
- [ ] No sensitive data in logs
- [ ] Code-reviewer agent run

## Step 6 — Verification

Run `/verification-loop` against the affected scenarios before marking done.
