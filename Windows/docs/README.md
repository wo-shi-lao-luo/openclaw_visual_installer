# Windows Docs

This directory is the source of truth for Windows-area planning and design docs.

## Current docs

- `PRD.md` — product scope and planning
- `ARCHITECTURE.md` — architecture and system boundaries
- `adr-001-tech-stack.md` — ADRs and implementation decisions
- `README.md` — documentation index

## Package entry point and tests

- canonical implementation entry point: `../src/index.ts`
- test command: `npm test` from the `Windows/` directory
- typecheck command: `npm run typecheck` from the `Windows/` directory

## Related area folders

- `../src/` — Windows app shell and installer code
- `../tests/` — Windows test coverage
- `../scripts/` — automation helpers, when added
- `../assets/` — static assets, when added
