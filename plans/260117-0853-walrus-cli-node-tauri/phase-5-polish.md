---
title: "Phase 5: Polish & Distribution"
description: "Testing, Documentation, and Distribution workflows."
status: pending
priority: P3
effort: 6d
depends_on: ["Phase 3", "Phase 4"]
---

# Phase 5: Polish & Distribution

## Objectives
- Ensure stability with E2E tests.
- Create user-facing documentation.
- Set up release pipelines for NPM and Binaries.

## Tasks

### 5.1 Testing
- [ ] **CLI E2E**: Test the full flow `init -> deploy`.
- [ ] **Integration**: Mock Walrus/Sui endpoints to test failure cases.

### 5.2 Documentation
- [ ] `README.md`: usage instructions.
- [ ] `docs/commands.md`: Reference for all CLI flags.
- [ ] `docs/troubleshooting.md`.

### 5.3 CI/CD & Publishing
- [ ] GitHub Action: Build `packages/core`.
- [ ] GitHub Action: Build `apps/cli` (transpile to JS).
- [ ] GitHub Action: Build `apps/desktop` (Tauri build for Win/Mac/Linux).
- [ ] **Release Strategy**:
    - Publish `walrus-cli` to npm.
    - Attach Tauri binaries to GitHub Releases.
    - (Optional) Create a `postinstall` script in CLI to download the binary? Or just keep them separate for now.

### 5.4 Final Polish
- [ ] Code cleanup (linting).
- [ ] Security audit (scan dependencies).

## Definition of Done
- CI is green.
- `npm install -g @walrus/cli` works (simulated via local registry).
- Documentation is complete and accurate.
