---
name: FOLDER_STRUCTURE.md
owner_role: Architect
maintainers:
  - Architect
  - Project Manager
minimal: false
created: 2026-03-25
updated: 2026-03-25
---

# Folder Structure

## Purpose

This file defines where project files belong and how the repository should stay organized.

## Top-Level Directories

### `project-manager/`
Product planning and requirements.

Expected contents:
- `PRD.md`
- planning notes that are meant to survive as project source material

### `architecture/`
System design and technical decision artifacts.

Expected contents:
- architecture drafts
- interface contracts
- design notes
- diagrams or supporting docs

### `implementation/`
Implementation code and source assets.

Expected contents:
- application source code
- installer logic
- platform-specific modules
- runtime support code

### `tests/`
Automated tests and test fixtures.

Expected contents:
- unit tests
- integration tests
- e2e or smoke tests
- fixtures and test data

### `scripts/`
Utility and automation scripts.

Expected contents:
- build scripts
- packaging scripts
- diagnostics helpers
- local automation helpers

### `docs/`
User-facing or support-facing documentation.

Expected contents:
- install guides
- support runbooks
- release notes
- troubleshooting notes

### `assets/`
Static assets used by the installer.

Expected contents:
- icons
- images
- UI artwork
- bundled static resources

## Placement Rules

- Keep product requirements in `project-manager/`
- Keep technical design in `architecture/`
- Keep executable code in `implementation/`
- Keep tests separate from source code
- Keep reusable scripts in `scripts/`
- Keep user/support documentation in `docs/`
- Keep static media in `assets/`

## Naming Rules

- Prefer clear, stable, lowercase names
- Use hyphen-separated filenames for multi-word documents
- Avoid versions in filenames such as `final`, `v2`, or `latest`
- Do not create duplicate authoritative files for the same topic

## What Should Not Be Created Casually

- ad hoc root-level scratch files
- duplicate PRDs
- multiple competing architecture docs
- throwaway dumps of logs or notes
- versioned files that imply parallel sources of truth

## Source of Truth Guidance

At minimum, the repository should keep the following authoritative files visible and current:
- `project-manager/PRD.md`
- `README.md`
- `ARCHITECTURE.md`
- `FOLDER_STRUCTURE.md`

## Organization Principle

If a file is important enough to influence decisions later, keep it in a stable location and make its role explicit. If it is temporary, keep it out of the long-lived structure or mark it deprecated before removal.
