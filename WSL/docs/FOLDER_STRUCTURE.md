---
name: FOLDER_STRUCTURE.md
minimal: false
created: 2026-03-25
updated: 2026-03-25
---

# Folder Structure

## Purpose

This file defines where project files belong and how the repository should stay organized.

## Top-Level Directories

### `docs/`
Planning, product, architecture, and task documents.

Expected contents:
- `PRD.md`
- `ARCHITECTURE.md`
- `FOLDER_STRUCTURE.md`
- `TASKS.md`
- ADRs such as `adr-*.md`
- supporting planning notes that are meant to survive as project source material

### `src/`
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

### `assets/`
Static assets used by the installer.

Expected contents:
- icons
- images
- UI artwork
- bundled static resources

## Placement Rules

- Keep product requirements and planning in `docs/`
- Keep technical design and ADRs in `docs/`
- Keep executable code in `src/`
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

For the WSL legacy area only, keep the following authoritative files visible and current:
- `../README.md`
- `PRD.md`
- `ARCHITECTURE.md`
- `FOLDER_STRUCTURE.md`
- `TASKS.md`
- `adr-*.md`

These files are the source of truth for the legacy WSL product area. The repo-wide split and the native Windows product area are documented outside this subtree.

## Organization Principle

If a file is important enough to influence decisions later, keep it in a stable location and make its role explicit. If it is temporary, keep it out of the long-lived structure or mark it deprecated before removal.
