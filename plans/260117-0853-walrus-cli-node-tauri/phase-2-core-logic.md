---
title: "Phase 2: Core Logic"
description: "Walrus binary wrapper, Sui integration, and config management."
status: pending
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
- [ ] Install `@mysten/sui.js`.
- [ ] Create `SuiClient` wrapper.
- [ ] Implement `WalletManager` (load keypairs from keystore or private key).
- [ ] Implement `TransactionBuilder` for common moves (e.g., registering a site).
- [ ] **Implement Cost Analytics**:
    - [ ] Fetch current Epoch gas prices and storage rebates via Sui RPC.
    - [ ] Calculate and display Gross Cost vs. Net Cost (Storage Cost - Rebate) for deployments.

### 2.2 Walrus Protocol Logic (`packages/core`)
- [ ] Create `WalrusBinaryManager` class.
    - [ ] Logic to detect OS/Arch.
    - [ ] Logic to download the correct `walrus` binary release.
    - [ ] Logic to verify checksums (security).
    - [ ] Logic to cache the binary in `~/.walrus/bin`.
- [ ] Create `WalrusClient` (Wrapper around Binary).
    - [ ] Implement `storeBlob(path)` -> executes `walrus store`.
    - [ ] Implement `readBlob(blobId)` -> executes `walrus read`.
    - [ ] Implement `deleteBlob(blobId)` -> executes `walrus delete`.
    - [ ] Parse binary output (JSON/Text) into structured objects.

### 2.3 Site Management Logic
- [ ] Implement `SiteManager`.
- [ ] **Implement Smart Diff Engine**:
    - [ ] Calculate hashes (BLAKE3/SHA256) of local files.
    - [ ] Compare with deployed site state/manifest to identify changed files.
    - [ ] Generate diff (added, modified, deleted) to minimize uploads.
- [ ] **Implement Auto-MIME**:
    - [ ] Integrate `mime-types` library in Node.js.
    - [ ] Automatically detect and set correct `Content-Type` for each file upload.
- [ ] Logic to generate the `site-object` structure for Sui.

### 2.4 State & Configuration
- [ ] Enhance `ConfigManager` to support environments (devnet, testnet, mainnet).
- [ ] Implement local state tracking (`.walrus/state.json`) for deployments.

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
