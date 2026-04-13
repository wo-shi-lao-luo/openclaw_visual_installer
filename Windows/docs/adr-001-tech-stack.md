# ADR 001: Windows shell stack decision pending

## Status

Proposed

## Context

The Windows product area needs a native installer shell, but Phase 1 does not require a final framework decision to define the product scope or folder structure.

## Decision

Keep the Phase 1 scaffold framework-agnostic.

The implementation area will provide an obvious shell entry point, but the repository will not commit to Electron or Tauri until the Windows product needs a concrete runtime choice.

## Consequences

- The product can start with a clean Windows-native boundary.
- Architecture and product docs stay valid while the host decision is pending.
- Future implementation work can select Electron or Tauri without rewriting the Phase 1 scope documents.
