---
title: "Phase 2: Core Logic"
description: "Walrus binary wrapper, Sui integration, and config management."
status: completed
priority: P1
effort: 8d
depends_on: ["Phase 1"]
---

# Phase 2: Core Logic

## Objectives
- Implement `WalrusBinaryManager` to download and manage the official `walrus` binary.
- Implement wrapper logic for `walrus` binary commands (store, read, delete-blob).
- Implement Sui blockchain interactions (Transaction Blocks).
- Robust configuration and state management.

## Tasks

### 2.1 Sui Integration (`packages/core`)
- [x] Install `@mysten/sui.js`.
- [x] Create `SuiClient` wrapper.
- [x] Implement `WalletManager` (load keypairs from keystore or private key).
- [x] Implement `TransactionBuilder` for common moves (e.g., registering a site).
- [x] **Implement Cost Analytics**:
    - [x] Fetch current Epoch gas prices and storage rebates via Sui RPC.
    - [x] Calculate and display Gross Cost vs. Net Cost (Storage Cost - Rebate) for deployments.
    - [ ] **Pre-flight Balance Check**:
        - [ ] Implement logic to check WAL balance before deployment.
        - [ ] Implement `get-wal` wrapper (Suibase integration) to swap SUI for WAL if needed.

### 2.2 Walrus Protocol Logic (`packages/core`)
- [ ] Update `WalrusBinaryManager`:
    - [ ] Add `resolveBinary()`: Check system PATH first, then fallback to local `~/.walrus/bin`.
    - [ ] Logic to download `site-builder` binary (not just `walrus`).
    - [ ] Logic to verify checksums (security).
- [ ] Create `SiteBuilderClient` (Wrapper around Binary).
    - [ ] Implement `publish(distDir, epochs)` -> executes `site-builder publish`.
    - [ ] Implement `update(distDir, objectId, epochs)` -> executes `site-builder update`.
    - [ ] Implement `parseOutput(stdout)`: Use Regex to extract `New site object ID`.

### 2.3 Site Management Logic
- [ ] Implement `SiteManager`.
- [ ] **Deprecate Custom Diff Engine**:
    - [ ] Leverage `site-builder update` command which handles diffing and merkle tree updates natively.
- [ ] **Implement Auto-MIME**:
    - [ ] Integrate `mime-types` library in Node.js (Backup if binary fails auto-detect).
- [ ] **State Persistence**:
    - [ ] Implement `.env` file integration (Read/Write `WALRUS_SITE_OBJECT_ID`).

### 2.4 State & Configuration
- [ ] Enhance `ConfigManager` to support environments (devnet, testnet, mainnet).
- [x] Implement local state tracking (`.walrus/state.json`) for deployments.

## Technical Details
- **Walrus Interaction**: We are NOT using a REST API directly. We are wrapping the official `walrus` Rust binary.
- **Binary Management**: The CLI must ensure the binary exists before running commands. It should prompt to download if missing.
- **Diffing**: Use file hashes (BLAKE3 or SHA256) to detect changes.
- **Error Handling**: Map binary exit codes/stderr to JS Error classes.

## Definition of Done
- Can programmatically sign and execute a dummy transaction on Sui Testnet.
- `WalrusBinaryManager` successfully downloads and runs `walrus --version`.
- `WalrusClient` can upload a file by spawning the binary.
- `packages/core` has 80% unit test coverage for logic classes.
