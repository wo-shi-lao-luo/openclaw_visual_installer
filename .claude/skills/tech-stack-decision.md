---
name: tech-stack-decision
description: Evaluate and decide the tech stack for the OpenClaw Visual Installer (Tauri vs Electron vs .NET WPF). Produces an ADR and activates the right ECC review skills.
---

# Tech Stack Decision for OpenClaw Visual Installer

The architecture currently leaves the tech stack open. This skill helps evaluate and lock the decision.

## Evaluation Criteria

Score each candidate on these dimensions (1–5):

| Criterion | Why it matters for this project |
|-----------|--------------------------------|
| Windows privilege/UAC integration | Installer needs admin elevation |
| WSL process interaction | Must run `wsl`, parse output, manage distros |
| Distribution size | Single .exe preferred for installer |
| Startup time | First impression matters |
| UI richness | Multi-step wizard with real-time progress |
| Error recovery UX | Complex failure states need good state management |
| Test tooling | 80%+ coverage requirement |
| ECC tooling support | Better ECC skills = better AI assistance |

## Candidate Summary

### Tauri (Rust + WebView2)
- Native Rust backend: excellent for WSL subprocess management
- WebView2 frontend: full web stack for UI
- Small binary, fast startup
- UAC via Windows manifest or `runas`
- ECC: `/everything-claude-code:rust-review`, `/everything-claude-code:rust-build`, `/everything-claude-code:rust-test`

### Electron (TypeScript/Node.js)
- Node child_process for WSL interaction
- Chromium bundled: larger binary (~150MB)
- Mature ecosystem, great UI component libraries
- UAC via `sudo-prompt` or relaunch-as-admin pattern
- ECC: `/everything-claude-code:typescript-reviewer`, `/everything-claude-code:e2e` (Playwright built-in)

### .NET WPF / WinUI 3 (C#)
- Best native Windows UAC integration
- Best Windows API access
- Requires .NET runtime (or self-contained bundle)
- ECC: `/everything-claude-code:java-reviewer` (partial C# overlap; less coverage)

## Decision Output

Record the decision as an ADR in `architecture/adr-001-tech-stack.md`:

```markdown
# ADR-001: Tech Stack Selection

## Status: [Proposed | Accepted | Superseded]
## Date: YYYY-MM-DD

## Context
[What forces and constraints drove this decision]

## Decision
[Chosen stack and rationale]

## Consequences
- Positive: ...
- Negative: ...
- ECC skills activated: ...
```

## After Decision

Update `CLAUDE.md` Tech Stack section with the chosen stack and confirm which ECC review skill to use for all code reviews.
