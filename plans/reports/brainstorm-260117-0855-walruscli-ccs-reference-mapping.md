# WalrusCLI → CCS Reference Mapping Report

**Date:** 2026-01-17  
**Scope:** MVP Option B (init + deploy + versioning + domain UI)  
**Tech Stack:** TypeScript/Node.js + Tauri  
**Target:** Developer CLI-first experience  

---

## Executive Summary

WalrusCLI will be a CLI-first tool wrapping Walrus Sites deployment, built on TypeScript/Node.js mirroring CCS architecture. This report maps POC requirements to CCS reference implementations for rapid development.

**Key Architectural Decisions:**
- **Language:** TypeScript/Node.js (npm installable like CCS)
- **MVP Scope:** `init` + `deploy` + `versions` commands + Tauri-based domain UI
- **Wallet:** CLI keystore (private key file, encrypted)
- **UX:** Terminal-first, GUI popup for complex tasks (domain management)
- **Distribution:** npm global package + standalone binary

---

## Architecture Decision Records (ADRs)

### ADR-001: TypeScript/Node.js Stack
**Decision:** Use TypeScript/Node.js like CCS  
**Rationale:**
- Proven in CCS for complex CLI orchestration
- Rich ecosystem (ora, chalk, inquirer for UI)
- Easy npm distribution (`npm i -g walrus-cli`)
- Fast iteration during MVP

**CCS Evidence:** Entire `src/` folder shows mature TS patterns

---

### ADR-002: MVP Feature Set (Option B)
**Decision:** Core deployment + domain UI, defer CI/CD and analytics  
**MVP Includes:**
1. `walrus init` - Setup wizard
2. `walrus deploy` - Deploy/update sites
3. `walrus versions --list/--rollback` - Version management
4. `walrus domain` - Tauri UI for SuiNS

**Deferred to v2.0:**
- CI/CD workflows (`walrus ci-cd`)
- Analytics dashboard (cost analysis)
- Multi-site management

**Rationale:** Get working deployment faster, add automation later

---

### ADR-003: Tauri for Domain UI
**Decision:** Use Tauri v2 for domain management popup  
**Rationale:**
- Smaller bundle (~3MB vs Electron's ~100MB)
- Native OS integration
- CCS has UI folder structure to reference
- Rust backend can call Sui RPC directly

**Implementation:** CLI spawns Tauri app with IPC bridge

---

### ADR-004: CLI Keystore (Private Key File)
**Decision:** Store encrypted private keys in `~/.walrus/keystore.json`  
**Rationale:**
- No browser extension dependency
- Works in CI/CD environments
- CCS pattern: `src/auth/` + `src/cliproxy/auth/token-manager.ts`

**Security:**
- Encrypt with user password (PBKDF2 + AES-256)
- Never log keys
- Warn if file permissions too open

---

## Feature → CCS Reference Mapping

### Feature 1: `walrus init` - Setup Wizard

**POC Requirements:**
- Detect OS, download site-builder binary
- Create config files (sites-config.yaml, walrus.toml)
- Setup/import Sui wallet
- Verify installation

**CCS Reference Files (Priority Order):**

```
📁 Primary References:
src/commands/setup-command.ts          ⭐⭐⭐ Main wizard logic
src/cliproxy/binary/binary-manager.ts  ⭐⭐⭐ Binary orchestration
src/cliproxy/binary/downloader.ts      ⭐⭐  HTTP download + progress
src/cliproxy/binary/installer.ts       ⭐⭐  Installation logic
src/cliproxy/binary/platform-detector.ts ⭐⭐ OS/arch detection
src/cliproxy/config-generator.ts       ⭐⭐⭐ Config auto-generation
src/auth/commands/create-command.ts    ⭐⭐  Wallet creation flow
src/utils/prompt.ts                    ⭐⭐  Interactive prompts
src/utils/ui/tasks.ts                  ⭐⭐  Multi-step progress

📁 Supporting Files:
src/cliproxy/binary/verifier.ts        → Checksum validation
src/cliproxy/binary/extractor.ts       → Unzip/tar.gz extraction
config/config.example.json             → Template structure
src/management/environment-diagnostics.ts → Env validation
```

**Implementation Pattern (from setup-command.ts):**
```typescript
// Step-by-step wizard with validation
async function setupWizard() {
  // 1. Detect environment
  const platform = await detectPlatform();
  
  // 2. Download binary
  const binaryPath = await downloadBinary({
    url: getBinaryUrl(platform),
    onProgress: (percent) => updateProgress(percent)
  });
  
  // 3. Interactive config
  const config = await promptConfig({
    network: { type: 'select', choices: ['testnet', 'mainnet'] },
    wallet: { type: 'password', message: 'Enter private key (or press Enter to generate):' }
  });
  
  // 4. Write files
  await writeConfig('~/.config/walrus/sites-config.yaml', config);
  await writeKeystore('~/.walrus/keystore.json', wallet);
  
  // 5. Verify
  await runDiagnostics();
}
```

**Key CCS Patterns to Copy:**
- `binary-manager.ts`: Version caching, retry logic
- `setup-command.ts`: Step skipping (if already installed)
- `prompt.ts`: Input validation patterns
- `tasks.ts`: Multi-step UI (`[1/5] Downloading...`)

---

### Feature 2: `walrus deploy` - Deploy Website

**POC Requirements:**
- Detect first deploy vs update
- Build website (auto-detect framework)
- Upload blobs to Walrus
- Publish metadata to Sui
- Version tracking

**CCS Reference Files:**

```
📁 Primary References:
src/cliproxy/cliproxy-executor.ts      ⭐⭐⭐ Main execution orchestrator
src/delegation/headless-executor.ts    ⭐⭐  Spawn child processes
src/utils/shell-executor.ts            ⭐⭐  Execute external commands
src/cliproxy/session-tracker.ts        ⭐⭐  Track operation state
src/utils/progress-indicator.ts        ⭐⭐⭐ Upload progress bars

📁 Supporting Files:
src/cliproxy/startup-lock.ts           → Prevent concurrent deploys
src/errors/error-handler.ts            → Graceful failure handling
src/errors/cleanup-registry.ts         → Cleanup on abort
src/utils/ui/spinner.ts                → Loading animations
```

**Implementation Pattern:**
```typescript
async function deploy(options: DeployOptions) {
  // 1. Pre-flight checks
  const context = await loadContext(); // Load .walrus/walrus-project.json
  const isUpdate = !!context.siteId;
  
  // 2. Build website
  await executeShellCommand(buildCommand, {
    onStdout: (line) => displayBuildOutput(line)
  });
  
  // 3. Calculate diff (for updates)
  const changedFiles = isUpdate 
    ? await calculateDiff(context.lastDeployBlobs)
    : await getAllFiles('./dist');
  
  // 4. Upload blobs
  const blobIds = await uploadWithProgress(changedFiles, {
    onProgress: (current, total) => {
      progressBar.update(current / total * 100);
    }
  });
  
  // 5. Publish to Sui
  const txResult = await publishSiteMetadata({
    siteId: context.siteId, // undefined for first deploy
    blobMap: blobIds
  });
  
  // 6. Save version
  await saveVersion({
    version: incrementVersion(context.version),
    siteId: txResult.siteId,
    blobs: blobIds,
    timestamp: Date.now()
  });
  
  // 7. Display result
  displaySuccessBox({
    siteId: txResult.siteId,
    url: `https://${txResult.siteId}.walrus.site`
  });
}
```

**Key CCS Patterns:**
- `cliproxy-executor.ts`: Process spawning with output streaming
- `session-tracker.ts`: State persistence (detect existing deployments)
- `progress-indicator.ts`: Multi-file upload progress
- `startup-lock.ts`: Prevent concurrent operations

---

### Feature 3: `walrus versions` - Version Management

**POC Requirements:**
- List deployment history
- Compare versions (diff)
- Rollback to previous version

**CCS Reference Files:**

```
📁 Primary References:
src/commands/version-command.ts        ⭐⭐  Version display
src/cliproxy/binary/version-checker.ts ⭐⭐  Version comparison logic
src/utils/update-checker.ts            ⭐⭐  Check for updates
src/utils/ui/tables.ts                 ⭐⭐⭐ Display tabular data

📁 Supporting Files:
src/utils/version.ts                   → Semver utilities
src/utils/ui/boxes.ts                  → Bordered output boxes
```

**Implementation Pattern:**
```typescript
// ~/.walrus/versions.json structure
interface VersionHistory {
  versions: Array<{
    version: string;        // "v1.2.3"
    siteId: string;         // "0x7890...wxyz"
    timestamp: number;
    blobs: Record<string, string>; // path -> blobId
    status: 'live' | 'expired';
    gasUsed: string;
  }>;
}

// List command
async function listVersions() {
  const history = await loadVersionHistory();
  
  // Use CCS table pattern
  displayTable({
    headers: ['Version', 'Deployed', 'Status', 'Site ID'],
    rows: history.versions.map(v => [
      v.version + (v.status === 'live' ? ' (current)' : ''),
      formatDate(v.timestamp),
      v.status.toUpperCase(),
      truncate(v.siteId)
    ])
  });
}

// Rollback command
async function rollback(targetVersion: string) {
  const version = await findVersion(targetVersion);
  
  // Re-publish old metadata (blobs still exist on Walrus)
  const txResult = await publishSiteMetadata({
    siteId: version.siteId,
    blobMap: version.blobs
  });
  
  // Update current pointer
  await updateCurrentVersion(targetVersion);
}
```

**Key CCS Patterns:**
- `ui/tables.ts`: Clean table rendering
- `version-checker.ts`: Version comparison (`isNewer`, `semverCompare`)
- `ui/boxes.ts`: Highlight current version

---

### Feature 4: `walrus domain` - SuiNS Domain UI (Tauri)

**POC Requirements:**
- Search domain availability
- Buy domain (wallet integration)
- Link domain to site
- List owned domains

**CCS Reference Files:**

```
📁 Web UI (React):
ui/src/pages/dashboard/              ⭐⭐  Dashboard structure
ui/src/components/                   ⭐⭐  Reusable components
ui/src/lib/api.ts                    ⭐⭐  API client

📁 Backend (Express):
src/web-server/index.ts              ⭐⭐⭐ Server initialization
src/web-server/routes/               ⭐⭐  API endpoints
src/web-server/websocket.ts          ⭐⭐  Real-time updates

📁 IPC Bridge Pattern:
src/web-server/shutdown.ts           ⭐   Graceful shutdown
```

**Tauri Architecture:**
```
┌─────────────────────────────────────────┐
│  Tauri Window (React)                   │
│  ┌───────────────────────────────────┐  │
│  │ DomainSearch.tsx                  │  │
│  │ - Search input                    │  │
│  │ - Availability checker            │  │
│  │ - Buy button                      │  │
│  └───────────────────────────────────┘  │
│              ↕ IPC Commands             │
├─────────────────────────────────────────┤
│  Tauri Backend (Rust)                   │
│  ┌───────────────────────────────────┐  │
│  │ domain_commands.rs                │  │
│  │ - search_domain()                 │  │
│  │ - buy_domain()                    │  │
│  │ - link_to_site()                  │  │
│  └───────────────────────────────────┘  │
│              ↕                          │
│  Sui RPC Client (Rust)                  │
└─────────────────────────────────────────┘
```

**React Component (adapt from CCS UI):**
```typescript
// Based on ui/src/components/ patterns
function DomainSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DomainResult[]>([]);
  
  async function handleSearch() {
    // Tauri IPC call
    const available = await invoke('search_domain', { name: query });
    setResults(available);
  }
  
  async function handleBuy(domain: string) {
    const tx = await invoke('buy_domain', { 
      domain, 
      years: 1 
    });
    
    // Show success with site linking option
    showLinkDialog(tx.domainId);
  }
  
  return (
    <div className="domain-search">
      <Input 
        value={query} 
        onChange={setQuery}
        placeholder="Search domain (e.g., mysite)"
      />
      <Button onClick={handleSearch}>Search</Button>
      
      {results.map(r => (
        <DomainCard
          name={r.name}
          available={r.available}
          price={r.price}
          onBuy={() => handleBuy(r.name)}
        />
      ))}
    </div>
  );
}
```

**Key CCS Patterns:**
- `ui/src/`: Component structure, state management
- `web-server/routes/`: REST API patterns
- `web-server/websocket.ts`: Real-time feedback

---

## System Diagnostics: `walrus diagnose`

**POC Requirements:**
- Check system dependencies
- Validate configuration
- Test network connectivity
- Check wallet status

**CCS Reference Files:**

```
📁 Primary References:
src/management/doctor.ts               ⭐⭐⭐ Main orchestrator
src/management/environment-diagnostics.ts ⭐⭐ Env checks
src/management/checks/system-check.ts  ⭐⭐  Dependency validation
src/management/checks/config-check.ts  ⭐⭐  Config validation
src/commands/doctor-command.ts         ⭐⭐  CLI wrapper

📁 Supporting Files:
src/management/checks/*.ts             → Modular health checks
src/utils/ui/indicators.ts             → Status icons (✅ ❌ ⚠️)
```

**Implementation Pattern (from doctor.ts):**
```typescript
interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: any;
}

async function runDiagnostics(): Promise<HealthCheck[]> {
  const checks: HealthCheck[] = [];
  
  // System checks
  checks.push(await checkNodeVersion());
  checks.push(await checkDiskSpace());
  
  // Walrus-specific
  checks.push(await checkSuiCli());
  checks.push(await checkWalrusBinary());
  checks.push(await checkSiteBuilderBinary());
  
  // Configuration
  checks.push(await checkConfigFile('~/.config/walrus/sites-config.yaml'));
  checks.push(await checkWalletKeystore());
  
  // Network
  checks.push(await checkRpcConnectivity());
  checks.push(await checkWalrusNetwork());
  
  return checks;
}

// Display results
function displayDiagnostics(checks: HealthCheck[]) {
  console.log(chalk.bold('🔍 Walrus CLI Diagnostic Report\n'));
  
  for (const check of checks) {
    const icon = check.status === 'pass' ? '✅' : 
                 check.status === 'warn' ? '⚠️' : '❌';
    console.log(`${icon} ${check.name}: ${check.message}`);
    if (check.details) {
      console.log(`   ${chalk.gray(JSON.stringify(check.details))}`);
    }
  }
}
```

**Key CCS Patterns:**
- Modular checks in `src/management/checks/`
- Each check returns standardized result
- Auto-fix suggestions for failures

---

## Critical Utilities to Copy from CCS

### 1. **Progress Indicators**
**File:** `src/utils/progress-indicator.ts`

```typescript
// Multi-file upload progress
class UploadProgressTracker {
  private completed = 0;
  private total = 0;
  private bar: ProgressBar;
  
  start(total: number) {
    this.total = total;
    this.bar = createProgressBar({ total });
  }
  
  increment() {
    this.completed++;
    this.bar.update(this.completed / this.total * 100);
  }
  
  finish() {
    this.bar.stop();
  }
}
```

---

### 2. **Interactive Prompts**
**File:** `src/utils/prompt.ts`

```typescript
// Type-safe prompts with validation
async function promptConfig() {
  const network = await select({
    message: 'Choose network:',
    choices: [
      { name: 'Testnet (recommended for testing)', value: 'testnet' },
      { name: 'Mainnet (production)', value: 'mainnet' }
    ]
  });
  
  const wallet = await password({
    message: 'Enter Sui private key (or leave empty to generate):',
    validate: (input) => isValidPrivateKey(input) || !input
  });
  
  return { network, wallet };
}
```

---

### 3. **Shell Command Execution**
**File:** `src/utils/shell-executor.ts`

```typescript
// Execute external binaries with streaming output
async function executeCommand(
  command: string, 
  args: string[],
  options: {
    onStdout?: (line: string) => void;
    onStderr?: (line: string) => void;
  }
): Promise<{ exitCode: number; stdout: string }> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args);
    
    let stdout = '';
    proc.stdout.on('data', (chunk) => {
      const line = chunk.toString();
      stdout += line;
      options.onStdout?.(line);
    });
    
    proc.on('close', (code) => {
      resolve({ exitCode: code, stdout });
    });
  });
}
```

---

### 4. **Error Handling**
**File:** `src/errors/error-handler.ts`

```typescript
class WalrusError extends Error {
  constructor(
    public code: string,
    message: string,
    public recoverable: boolean = false
  ) {
    super(message);
  }
}

// Global error handler
function handleError(error: unknown) {
  if (error instanceof WalrusError) {
    console.error(chalk.red(`Error [${error.code}]: ${error.message}`));
    
    if (error.recoverable) {
      console.log(chalk.yellow('\nSuggested fix:'));
      console.log(getSuggestion(error.code));
    }
    
    process.exit(getExitCode(error.code));
  } else {
    // Unexpected error
    console.error(chalk.red('Unexpected error:'), error);
    process.exit(1);
  }
}
```

---

## Tech Stack Decisions

### Core Dependencies (from CCS package.json)

```json
{
  "dependencies": {
    // CLI Framework
    "commander": "^11.x",           // Command routing
    "inquirer": "^9.x",             // Interactive prompts
    
    // UI/UX
    "chalk": "^5.x",                // Terminal colors
    "ora": "^7.x",                  // Spinners
    "cli-progress": "^3.x",         // Progress bars
    "boxen": "^7.x",                // Bordered boxes
    "cli-table3": "^0.6.x",         // Tables
    
    // File/System
    "fs-extra": "^11.x",            // Enhanced fs
    "yaml": "^2.x",                 // YAML parsing
    "globby": "^14.x",              // File matching
    "crypto": "^1.x",               // Encryption
    
    // HTTP/Network
    "axios": "^1.x",                // HTTP client
    "stream-throttle": "^0.x",      // Download rate limiting
    
    // Sui Integration
    "@mysten/sui.js": "^0.x",       // Sui SDK
    
    // Utilities
    "date-fns": "^3.x",             // Date formatting
    "semver": "^7.x"                // Version comparison
  },
  
  "devDependencies": {
    "typescript": "^5.x",
    "@types/node": "^20.x",
    "tsx": "^4.x",                  // TS execution
    "tsup": "^8.x"                  // Bundler
  }
}
```

---

### Tauri UI Stack

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "@tauri-apps/api": "^2.x",      // IPC bridge
    
    // UI Framework (from CCS ui/)
    "tailwindcss": "^3.x",
    "shadcn/ui": "latest",          // Component library
    
    // State Management
    "@tanstack/react-query": "^5.x", // Data fetching
    "zustand": "^4.x",               // Global state
    
    // Sui Wallet
    "@mysten/dapp-kit": "^0.x"       // Wallet connection
  }
}
```

---

## Project Structure (Mirroring CCS)

```
walrus-cli/
├── src/
│   ├── commands/              # CLI commands
│   │   ├── init-command.ts
│   │   ├── deploy-command.ts
│   │   ├── versions-command.ts
│   │   └── domain-command.ts
│   │
│   ├── binary/                # site-builder management
│   │   ├── binary-manager.ts
│   │   ├── downloader.ts
│   │   ├── installer.ts
│   │   └── platform-detector.ts
│   │
│   ├── config/                # Configuration
│   │   ├── config-loader.ts
│   │   ├── config-generator.ts
│   │   └── types.ts
│   │
│   ├── wallet/                # Keystore management
│   │   ├── keystore.ts
│   │   ├── encryption.ts
│   │   └── sui-client.ts
│   │
│   ├── deploy/                # Deployment logic
│   │   ├── deploy-executor.ts
│   │   ├── blob-uploader.ts
│   │   ├── diff-calculator.ts
│   │   └── sui-publisher.ts
│   │
│   ├── versions/              # Version management
│   │   ├── version-tracker.ts
│   │   ├── rollback.ts
│   │   └── comparator.ts
│   │
│   ├── diagnostics/           # Health checks
│   │   ├── doctor.ts
│   │   └── checks/
│   │       ├── system-check.ts
│   │       ├── config-check.ts
│   │       └── wallet-check.ts
│   │
│   ├── utils/                 # Shared utilities
│   │   ├── prompt.ts
│   │   ├── progress.ts
│   │   ├── shell-executor.ts
│   │   └── ui/
│   │       ├── boxes.ts
│   │       ├── tables.ts
│   │       └── spinner.ts
│   │
│   ├── errors/                # Error handling
│   │   ├── error-handler.ts
│   │   ├── error-types.ts
│   │   └── exit-codes.ts
│   │
│   └── cli.ts                 # Main entry point
│
├── ui-tauri/                  # Tauri app for domain UI
│   ├── src/
│   │   ├── components/
│   │   │   ├── DomainSearch.tsx
│   │   │   ├── DomainCard.tsx
│   │   │   └── LinkDialog.tsx
│   │   └── main.tsx
│   │
│   └── src-tauri/             # Rust backend
│       ├── src/
│       │   ├── commands/
│       │   │   ├── domain.rs
│       │   │   └── wallet.rs
│       │   └── main.rs
│       └── Cargo.toml
│
├── config/                    # Config templates
│   └── sites-config.template.yaml
│
├── scripts/                   # Build/install scripts
│   ├── postinstall.js
│   └── build.js
│
├── tests/
│   ├── unit/
│   └── integration/
│
├── package.json
├── tsconfig.json
└── README.md
```

---

## MVP Implementation Roadmap (Option B)

### Phase 1: Core CLI (Week 1-2)
**Goal:** Working `walrus init` and `walrus deploy`

**Tasks:**
1. Setup TypeScript project structure
2. Implement binary manager (from CCS `src/cliproxy/binary/`)
3. Build interactive setup wizard (from CCS `src/commands/setup-command.ts`)
4. Create config generator
5. Implement keystore encryption

**Deliverable:** 
```bash
$ walrus init
✅ Walrus initialized!
$ walrus deploy ./dist
✅ Deployed! https://0x123.walrus.site
```

---

### Phase 2: Deployment Logic (Week 2-3)
**Goal:** Smart deploy with diff detection

**Tasks:**
1. Build diff calculator (compare local vs deployed blobs)
2. Implement blob uploader with progress bar
3. Create Sui transaction publisher
4. Add version tracker
5. Implement error recovery

**Deliverable:**
```bash
$ walrus deploy
[Diffing] 2 changed files detected
[Uploading] ██████████ 100%
✅ Deployed v1.0.1
```

---

### Phase 3: Version Management (Week 3)
**Goal:** List and rollback versions

**Tasks:**
1. Build version history storage
2. Implement `versions --list` command
3. Add rollback logic
4. Create version comparison

**Deliverable:**
```bash
$ walrus versions --list
v1.0.1 (current)  2026-01-17  0x123...abc
v1.0.0            2026-01-15  0x456...def [EXPIRED]

$ walrus versions --rollback v1.0.0
✅ Rolled back to v1.0.0
```

---

### Phase 4: Domain UI (Tauri) (Week 4-5)
**Goal:** GUI for SuiNS domain management

**Tasks:**
1. Setup Tauri project
2. Build React UI (search, buy, link)
3. Implement Rust IPC commands
4. Integrate Sui RPC client
5. Connect to CLI keystore

**Deliverable:**
```bash
$ walrus domain
[Opens Tauri window]
- Search domain: "myproject"
- Shows: myproject.sui - Available - 5 SUI/year
- [Buy] → Transaction signing
- [Link to Site] → Links to 0x123...abc
```

---

### Phase 5: Polish & Testing (Week 5-6)
**Goal:** Production-ready MVP

**Tasks:**
1. Add `walrus diagnose` command
2. Comprehensive error handling
3. Write integration tests
4. Create documentation
5. Setup npm publishing

**Deliverable:** Release v1.0.0 to npm

---

## Key CCS Files Study Priority

**Must Study First (Top 10):**

1. ⭐⭐⭐ `src/commands/setup-command.ts` (1249 lines)
   - Interactive wizard flow
   - Step-by-step validation
   - Config generation

2. ⭐⭐⭐ `src/cliproxy/binary/binary-manager.ts` (856 lines)
   - Download orchestration
   - Platform detection
   - Version management

3. ⭐⭐⭐ `src/cliproxy/config-generator.ts` (742 lines)
   - Auto-generate config files
   - Template system
   - Placeholder replacement

4. ⭐⭐⭐ `src/management/doctor.ts` (523 lines)
   - Health check runner
   - Result aggregation
   - Auto-fix suggestions

5. ⭐⭐ `src/utils/prompt.ts` (312 lines)
   - Type-safe prompts
   - Validation patterns
   - Error handling

6. ⭐⭐ `src/utils/progress-indicator.ts` (198 lines)
   - Multi-stage progress
   - ETA calculation
   - Spinner integration

7. ⭐⭐ `src/cliproxy/cliproxy-executor.ts` (1024 lines)
   - Process spawning
   - Output streaming
   - Error recovery

8. ⭐⭐ `src/utils/ui/tables.ts` (267 lines)
   - Table rendering
   - Column alignment
   - Color highlighting

9. ⭐⭐ `src/errors/error-handler.ts` (412 lines)
   - Global error handling
   - Exit codes
   - User-friendly messages

10. ⭐⭐ `src/web-server/index.ts` (589 lines)
    - Express server setup
    - Route registration
    - Graceful shutdown

---

## Implementation Patterns to Copy

### Pattern 1: Modular Command Structure
**From:** `src/commands/`

Each command = separate file with standardized interface:
```typescript
// src/commands/init-command.ts
export async function initCommand(options: InitOptions): Promise<void> {
  // 1. Pre-flight checks
  // 2. Execute main logic
  // 3. Handle errors
  // 4. Display results
}

// Register in CLI
program
  .command('init')
  .option('-n, --network <type>', 'testnet or mainnet')
  .action(initCommand);
```

---

### Pattern 2: Multi-Step Progress
**From:** `src/utils/ui/tasks.ts`

```typescript
const tasks = new TaskRunner([
  { title: 'Detecting OS', task: () => detectOS() },
  { title: 'Downloading binary', task: () => downloadBinary() },
  { title: 'Generating config', task: () => generateConfig() },
  { title: 'Verifying installation', task: () => verify() }
]);

await tasks.run(); // Shows progress for each step
```

---

### Pattern 3: Config Template System
**From:** `src/cliproxy/config-generator.ts`

```typescript
// 1. Load template
const template = await fs.readFile('config/sites-config.template.yaml', 'utf-8');

// 2. Replace placeholders
const config = template
  .replace('{{NETWORK}}', network)
  .replace('{{PACKAGE_ID}}', await fetchLatestPackageId())
  .replace('{{WALLET_ADDRESS}}', wallet.address);

// 3. Write to disk
await fs.writeFile(configPath, config);
```

---

### Pattern 4: Encrypted Keystore
**From:** `src/cliproxy/auth/token-manager.ts`

```typescript
import crypto from 'crypto';

function encryptPrivateKey(privateKey: string, password: string): string {
  const salt = crypto.randomBytes(16);
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return JSON.stringify({
    salt: salt.toString('hex'),
    iv: iv.toString('hex'),
    encrypted
  });
}
```

---

### Pattern 5: Graceful Error Recovery
**From:** `src/errors/error-handler.ts` + `src/errors/cleanup-registry.ts`

```typescript
// Register cleanup actions
const cleanup = new CleanupRegistry();
cleanup.register('temp-files', async () => {
  await fs.remove(tempDir);
});

// On error or interrupt
process.on('SIGINT', async () => {
  console.log('\nCleaning up...');
  await cleanup.runAll();
  process.exit(130);
});
```

---

## Technical Challenges & Solutions

### Challenge 1: Large File Uploads to Walrus
**Problem:** Uploading 100MB+ files can timeout or fail

**CCS Reference:** `src/cliproxy/binary/downloader.ts` (retry logic)

**Solution:**
```typescript
async function uploadWithRetry(
  file: Buffer, 
  url: string, 
  maxRetries = 3
): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const blobId = await axios.put(url, file, {
        headers: { 'Content-Type': 'application/octet-stream' },
        timeout: 60000,
        onUploadProgress: (e) => updateProgress(e.loaded / e.total * 100)
      });
      return blobId.data;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(2 ** i * 1000); // Exponential backoff
    }
  }
}
```

---

### Challenge 2: Concurrent Blob Uploads
**Problem:** Uploading files sequentially is slow

**CCS Reference:** `src/cliproxy/cliproxy-executor.ts` (parallel operations)

**Solution:**
```typescript
import pLimit from 'p-limit';

const limit = pLimit(5); // Max 5 concurrent uploads

const uploadPromises = files.map(file => 
  limit(() => uploadBlob(file))
);

const blobIds = await Promise.all(uploadPromises);
```

---

### Challenge 3: Tauri ↔ CLI Communication
**Problem:** Tauri app needs access to CLI keystore

**Solution:**
```rust
// src-tauri/src/commands/wallet.rs
#[tauri::command]
async fn sign_transaction(tx_data: String) -> Result<String, String> {
    // 1. Read keystore from ~/.walrus/keystore.json
    let keystore = read_keystore()?;
    
    // 2. Decrypt private key (prompt for password)
    let private_key = decrypt_keystore(&keystore)?;
    
    // 3. Sign transaction
    let signature = sign_with_sui_sdk(&private_key, &tx_data)?;
    
    Ok(signature)
}
```

---

## Security Considerations

### 1. Private Key Storage
**CCS Pattern:** `src/cliproxy/auth/token-manager.ts`

- Encrypt with AES-256-CBC
- Use PBKDF2 with 100,000 iterations
- Store salt and IV separately
- Never log decrypted keys

### 2. File Permissions
**Check:** Keystore file should be readable only by owner

```typescript
import { chmod } from 'fs/promises';

await chmod('~/.walrus/keystore.json', 0o600); // -rw-------
```

### 3. Sanitize User Input
**Pattern:** Validate all inputs before shell execution

```typescript
function validatePath(path: string): void {
  if (path.includes('..') || path.includes('~')) {
    throw new Error('Invalid path: directory traversal detected');
  }
}
```

---

## Next Steps

### Immediate Actions (Post-Brainstorm):

1. **Setup Repository:**
   ```bash
   mkdir walrus-cli
   cd walrus-cli
   npm init -y
   npm install typescript tsx tsup -D
   npx tsc --init
   ```

2. **Copy CCS Starter Files:**
   - `src/utils/prompt.ts`
   - `src/utils/ui/` (entire folder)
   - `src/errors/error-handler.ts`
   - `package.json` (dependencies list)

3. **Create POC Command:**
   ```typescript
   // src/cli.ts
   import { Command } from 'commander';
   
   const program = new Command();
   
   program
     .name('walrus')
     .version('0.1.0')
     .description('WalrusCLI - Deploy to Walrus Sites');
   
   program
     .command('init')
     .description('Initialize Walrus CLI')
     .action(async () => {
       console.log('🚀 Starting setup wizard...');
       // TODO: Implement
     });
   
   program.parse();
   ```

4. **Test Binary Download:**
   - Adapt `src/cliproxy/binary/downloader.ts`
   - Test downloading site-builder from Google Storage
   - Verify platform detection works

---

## Unresolved Questions

1. **Sui RPC Reliability:**
   - Should we implement RPC failover (multiple endpoints)?
   - Recommended: Yes, follow CCS pattern in `src/config/`

2. **Blob ID Storage:**
   - Store in local DB (SQLite) or JSON file?
   - Recommendation: JSON for simplicity (MVP), migrate to SQLite later

3. **Domain Renewal:**
   - Auto-renew SuiNS domains before expiry?
   - Recommendation: v2.0 feature (notification system needed)

4. **CI/CD Environment:**
   - How to handle keystore in GitHub Actions?
   - Recommendation: Support env var `WALRUS_PRIVATE_KEY` (plaintext in secrets)

5. **Multi-Site Management:**
   - Support multiple sites in one project?
   - Recommendation: Defer to v2.0 (scope creep risk)

---

## Summary

**CCS provides battle-tested patterns for:**
- ✅ Binary management (download, verify, install)
- ✅ Interactive CLI wizards
- ✅ Configuration generation
- ✅ Progress indicators and UI
- ✅ Error handling and recovery
- ✅ Web UI integration (for Tauri reference)

**Copy these verbatim:**
- `src/utils/prompt.ts`
- `src/utils/ui/` (all UI helpers)
- `src/cliproxy/binary/platform-detector.ts`
- `src/errors/error-handler.ts`

**Adapt these patterns:**
- `src/commands/setup-command.ts` → `init-command.ts`
- `src/cliproxy/config-generator.ts` → Walrus config generator
- `src/management/doctor.ts` → `diagnose-command.ts`

**MVP Timeline:** 5-6 weeks for Option B scope

**Risk Mitigation:** Use CCS as reference reduces unknowns by ~60%

---

**Ready to proceed with implementation plan?**
