---
title: "WalrusCLI Implementation Plan: Node.js + Tauri"
description: "Comprehensive roadmap for building the WalrusCLI with Node.js CLI and Tauri Desktop integration."
status: pending
priority: P1
effort: 32d
branch: main
tags: [node, tauri, sui, walrus, cli, monorepo]
created: 2026-01-17
---

# WalrusCLI Implementation Plan

This plan outlines the development of the WalrusCLI, a tool for interacting with the Walrus protocol on Sui, featuring a Node.js CLI and a Tauri-based Desktop GUI.

## Architecture Highlights
- **Monorepo**: pnpm workspaces for `apps/cli`, `apps/desktop`, and `packages/core`.
- **Core Logic**: Shared logic in `packages/core` (auth, wallet, transactions).
- **CLI**: Node.js based (Commander.js).
- **Desktop**: Tauri v2 (React + TypeScript).
- **Interaction**: CLI spawns Tauri process for GUI commands.
- **Protocol Wrapper**: Wraps the official `walrus` binary for protocol operations.

## Phased Approach

### [Phase 1: Foundation](./phase-1-foundation.md)
**Goal**: Set up the Monorepo structure, shared core package, and basic CLI skeleton.
- **Deliverables**: Working Monorepo, `packages/core` with types, `apps/cli` with `init` command.
- **Estimated Effort**: 3 days

### [Phase 2: Core Logic](./phase-2-core-logic.md)
**Goal**: Implement the business logic for Walrus (via binary wrapper) and Sui interactions.
- **Deliverables**: Walrus binary manager, store/read logic, Sui transaction building, Config management.
- **Estimated Effort**: 8 days

### [Phase 3: CLI Features](./phase-3-cli-features.md)
**Goal**: Build out the full suite of CLI commands.
- **Deliverables**: `deploy`, `status`, `login`, `site` commands.
- **Estimated Effort**: 5 days

### [Phase 4: Desktop Integration](./phase-4-desktop-integration.md)
**Goal**: Initialize Tauri app and implement the spawning mechanism from CLI.
- **Deliverables**: Tauri setup, Dashboard UI, IPC/Server bridge.
- **Estimated Effort**: 10 days

### [Phase 5: Polish & Distribution](./phase-5-polish.md)
**Goal**: Testing, documentation, and CI/CD for cross-platform distribution.
- **Deliverables**: E2E tests, User Docs, Release workflows.
- **Estimated Effort**: 6 days

## Strategic Risks
1.  **Binary Management**: Distributing the Tauri binary alongside the NPM package.
2.  **Walrus Binary Dependency**: Ensuring the user has the correct architecture version of the `walrus` binary.
3.  **State Sync**: Keeping CLI and GUI state in sync (files vs. memory).
4.  **Cross-Platform Paths**: Handling file paths correctly on Windows/Mac/Linux.
