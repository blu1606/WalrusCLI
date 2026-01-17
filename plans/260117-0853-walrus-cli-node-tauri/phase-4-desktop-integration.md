---
title: "Phase 4: Desktop Integration"
description: "Tauri app setup and CLI -> Desktop spawning."
status: pending
priority: P2
effort: 10d
depends_on: ["Phase 1"]
---

# Phase 4: Desktop Integration

## Objectives
- Initialize the Tauri application (`apps/desktop`).
- Implement the dashboard UI.
- Connect CLI spawning logic.

## Tasks

### 4.1 Tauri Setup (`apps/desktop`)
- [ ] Initialize Tauri v2 project (React + Vite + TS).
- [ ] Configure `tauri.conf.json`.
- [ ] Link `packages/core` to the frontend (if possible, or mock data for now).

### 4.2 Dashboard UI
- [ ] Setup `shadcn/ui` and Tailwind.
- [ ] Create **Overview** page (Recent deployments, Wallet balance).
- [ ] Create **Site Manager** page (Drag & drop upload area).
- [ ] Create **Settings** page (RPC endpoints, Walrus nodes).

### 4.3 CLI -> Desktop Spawning
- [ ] In `apps/cli`, implement `walrus dashboard` command.
- [ ] Logic to find the installed/bundled Tauri binary.
- [ ] Spawn process.
- [ ] Pass initial arguments (e.g., config path).

### 4.4 Data Synchronization
- [ ] *Option A (Simple)*: Desktop app reads the same config files as CLI.
- [ ] *Option B (Advanced)*: CLI starts a local WebSocket server, Desktop connects to it. (Start with Option A).

## Technical Details
- **Framework**: React.
- **Build**: Vite.
- **Tauri**: v2.
- **IPC**: Using Tauri commands for native operations if needed.

## Definition of Done
- `walrus dashboard` opens the native window.
- Desktop app displays real data from the config/state files managed by CLI.
