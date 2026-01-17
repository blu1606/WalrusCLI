---
title: "Phase 3: CLI Features"
description: "Build out the full suite of CLI commands."
status: pending
priority: P2
effort: 5d
depends_on: ["Phase 2"]
---

# Phase 3: CLI Features

## Objectives
- Expose Phase 2 logic via user-friendly CLI commands.
- Ensure robust feedback (spinners, progress bars).

## Tasks

### 3.1 Authentication Commands
- [ ] `walrus login`: Interactive prompt to import private key or connect wallet.
- [ ] `walrus whoami`: Show current active address and network.

### 3.2 Deployment Commands
- [ ] `walrus deploy`: Main command.
    - [ ] 1. Read configuration.
    - [ ] 2. Diff files.
    - [ ] 3. Upload blobs to Walrus.
    - [ ] 4. Update Sui Object (Transaction).
- [ ] `walrus status`: Show deployment history/status of the current site.

### 3.3 Site Management
- [ ] `walrus site create`: Register a new site object on Sui.
- [ ] `walrus site list`: List sites owned by the current address.
- [ ] `walrus site version`: specific version management (if supported).

### 3.4 UX Improvements
- [ ] Add spinners (using `ora`).
- [ ] Add progress bars (using `cli-progress`) for large uploads.
- [ ] Add `json` output flag for machine parsing.

## Technical Details
- **Input Validation**: usage of `zod` for config and argument validation.
- **Interactive Prompts**: `inquirer` for confirmation steps.

## Definition of Done
- User can run `walrus deploy` and see their static site updated on the network.
- `walrus login` successfully persists credentials securely (or warns about plain text).
