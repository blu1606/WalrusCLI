# Node.js CLI & Tauri Interaction Architecture

## Overview
The WalrusCLI project employs a hybrid architecture where a Node.js-based CLI (`apps/cli`) serves as the primary entry point, while a Tauri-based desktop application (`apps/desktop`) provides a graphical user interface. This report details the interaction model and bundling strategy.

## 1. Interaction Model: Node.js as Orchestrator
The Node.js CLI acts as the main orchestrator. When a user runs a command requiring a GUI (e.g., `walrus dashboard`), the CLI:
1.  Verifies the environment and dependencies.
2.  Locates the Tauri executable.
3.  Spawns the Tauri app as a child process using `child_process.spawn`.

### Communication Flow
- **CLI to GUI**: Initial state and configuration are passed via command-line arguments or environment variables when spawning the Tauri process.
- **GUI to CLI**: For complex interactions, a local WebSocket or HTTP server (started by the CLI) can facilitate bi-directional communication between the Node.js backend and the Tauri frontend.

## 2. Bundling Tauri as a Sidecar
Tauri's "sidecar" feature is typically used to include non-Rust binaries within a Tauri app. However, in this project, the relationship is inverted: the Node.js CLI includes the Tauri application.

### Implementation Strategy
1.  **Independent Builds**: `apps/cli` and `apps/desktop` are built independently within the pnpm workspace.
2.  **CLI Distribution**:
    - For development, the CLI references the Tauri binary in the `apps/desktop/src-tauri/target` directory.
    - For production, the platform-specific Tauri executable is bundled alongside the Node.js CLI or downloaded on-demand during installation.
3.  **Spawning Logic**:
    ```typescript
    import { spawn } from 'child_process';
    import path from 'path';

    const tauriPath = path.join(__dirname, 'bin', 'walrus-desktop');
    const child = spawn(tauriPath, [], {
      detached: true,
      stdio: 'ignore'
    });
    child.unref();
    ```

## 3. Benefits of this Architecture
- **Flexibility**: Users can choose between a headless CLI experience or a rich GUI.
- **Performance**: Tauri's small binary size and low memory footprint make it ideal for a "spawn-on-demand" GUI.
- **Shared Logic**: The `packages/core` workspace ensures that both the CLI and Desktop app use the same underlying business logic and Sui interaction code.

## 4. Considerations
- **Platform Specificity**: Separate Tauri binaries must be managed for Windows, macOS, and Linux.
- **Permissions**: The CLI must have the necessary permissions to execute the Tauri binary.
- **Path Resolution**: Robust logic is required to find the Tauri executable across different installation environments.
