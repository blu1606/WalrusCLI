---
title: "Phase 1: Foundation"
description: "Monorepo setup, shared packages, basic CLI skeleton."
status: pending
priority: P1
effort: 3d
depends_on: []
---

# Phase 1: Foundation

## Objectives
- Establish the Monorepo structure using pnpm workspaces.
- Create the shared `packages/core` library.
- Initialize the `apps/cli` Node.js application.
- Implement basic logging and error handling.

## Tasks

### 1.1 Monorepo Setup
- [ ] Initialize pnpm workspace (`pnpm-workspace.yaml`).
- [ ] Set up `tsconfig.base.json` for shared TypeScript config.
- [ ] Configure ESLint and Prettier for the root.
- [ ] Create directory structure: `apps/` and `packages/`.

### 1.2 Shared Core Package (`packages/core`)
- [ ] Initialize `packages/core`.
- [ ] Define basic types for Config and Walrus entities.
- [ ] Implement `Logger` utility (using `winston` or similar).
- [ ] Implement `ConfigManager` skeleton (reading/writing to `~/.walrus/config.yaml`).
- [ ] Export common utilities.

### 1.3 CLI Application Skeleton (`apps/cli`)
- [ ] Initialize `apps/cli` with `commander`.
- [ ] Link `packages/core` dependency.
- [ ] Create entry point `bin/walrus.js`.
- [ ] Implement `init` command (scaffolds a local project).
- [ ] Implement `diagnose` command (checks environment: Node, basic connectivity).

### 1.4 Testing Infrastructure
- [ ] Set up Vitest at the root or per package.
- [ ] Write a simple unit test for `ConfigManager`.

## Technical Details
- **Node Version**: LTS (v20+).
- **Package Manager**: pnpm.
- **Build Tool**: tsup (for bundling core and cli).

## Definition of Done
- `pnpm install` works at root.
- `apps/cli` can import code from `packages/core`.
- `walrus init` creates a basic config file or folder structure.
- `walrus diagnose` prints system info.
