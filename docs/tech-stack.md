# Tech Stack

## 1. Frontend
The desktop application's user interface is built with modern web technologies:
- **Framework**: [React](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/) for type-safe UI components.
- **Build Tool**: [Vite](https://vitejs.dev/) for fast development and optimized production builds.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for utility-first styling.
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) for accessible, high-quality pre-built components.

## 2. Backend & CLI
The project provides both a command-line interface and a desktop wrapper:
- **CLI (Node.js)**: Built using Node.js and TypeScript, located in `apps/cli`.
- **Desktop (Tauri)**: A lightweight desktop wrapper built with [Tauri v2](https://v2.tauri.app/), located in `apps/desktop`.

## 3. CLI Interaction Model
- **Argument Parsing**: [commander.js](https://github.com/tj/commander.js) is used for robust CLI command and argument handling.
- **Tauri Integration**: The Node.js CLI can spawn the Tauri desktop application as a child process when a GUI is requested.
- **User Interaction**: [inquirer](https://github.com/SBoudrias/Inquirer.js) (or similar) for interactive command-line prompts.

## 4. Core Libraries
- **Walrus Protocol**: `walrus` binary wrapper. The CLI manages the download and execution of the official `walrus` binary (or `site-builder` binary) to handle Walrus interactions. We do *not* use a direct JS client library for core protocol actions to ensure alignment with the official Rust implementation.
- **Blockchain Interface**: `@mysten/sui.js` for interacting with the Sui network.
- **Utilities**: Shared logic for authentication, configuration, and state management.

## 5. Architecture
The project is organized as a **Monorepo** using **pnpm workspaces** to manage multiple packages and applications efficiently.

## 6. Project Structure
The codebase is divided into three main areas:
- `apps/cli`: The Node.js-based command-line interface.
- `apps/desktop`: The Tauri-based desktop application wrapper.
- `packages/core`: Shared TypeScript logic, types, and utilities used by both the CLI and Desktop apps.

## 7. Infrastructure
- **CI/CD**: [GitHub Actions](https://github.com/features/actions) for automated testing, building, and deployment workflows.
