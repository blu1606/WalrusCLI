# AGENTS.md

AI agent guidance for WalrusCLI development. Read this before making code changes.

## Project Overview

**WalrusCLI** - TypeScript/Node.js CLI tool for deploying websites to Walrus Sites (decentralized hosting on Sui blockchain). Inspired by and mirroring architecture from [kaitranntt/ccs](https://github.com/kaitranntt/ccs).

**Reference Codebase:** `./ccs/` - Study CCS patterns before implementing features.

## Build & Test Commands

```bash
# Setup
npm install                  # Install dependencies
npm run build               # Compile TypeScript to dist/

# Development
npm run dev                 # Build + watch mode
npm run typecheck           # TypeScript type checking (no emit)

# Code Quality
npm run lint                # Run ESLint
npm run lint:fix            # Fix auto-fixable issues
npm run format              # Format with Prettier
npm run format:check        # Check formatting only
npm run validate            # Full check: typecheck + lint:fix + format:check + test

# Testing
npm test                    # Run all tests
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests
npm run test:watch          # Watch mode

# Single Test (Vitest pattern)
npm test -- tests/unit/binary/downloader.test.ts
npm test -- -t "downloads binary successfully"

# Pre-commit (MANDATORY ORDER)
npm run format              # Step 1: Fix formatting
npm run lint:fix            # Step 2: Fix lint
npm run validate            # Step 3: Verify all (MUST PASS)
```

**CRITICAL:** Run `format` → `lint:fix` → `validate` IN THAT ORDER before committing.

## Code Standards

### TypeScript Configuration

**Target:** ES2020, Node.js 18+, strict mode enabled

**Key Settings:**
- `strict: true` - All strict flags on
- `noUnusedLocals: true` - No unused variables
- `noImplicitReturns: true` - All code paths return
- `module: "commonjs"` - CommonJS output
- `esModuleInterop: true` - Default imports allowed

### ESLint Rules (ALL ERRORS)

```typescript
// ✅ CORRECT
const unused = 123;                    // ❌ Error: no-unused-vars
const _ignored = 123;                  // ✅ OK: underscore prefix

function process(data: any) {}         // ❌ Error: no-explicit-any
function process(data: unknown) {}     // ✅ OK: use unknown
function process(data: BlobData) {}    // ✅ BEST: specific type

const user = data!;                    // ❌ Error: no-non-null-assertion
const user = data ?? defaultUser;      // ✅ OK: nullish coalescing

let config = loadConfig();             // ❌ Error: prefer-const
const config = loadConfig();           // ✅ OK: const when not reassigned

if (value == null) {}                  // ❌ Error: eqeqeq
if (value === null) {}                 // ✅ OK: strict equality
```

### Import Order

```typescript
// 1. Node.js built-ins
import * as fs from 'fs';
import * as path from 'path';

// 2. External packages
import chalk from 'chalk';
import ora from 'ora';

// 3. Internal modules (relative imports)
import { BinaryManager } from './binary/binary-manager';
import { ConfigLoader } from './config/config-loader';
import type { WalrusConfig } from './types';

// 4. Type-only imports (grouped separately)
import type { DeployOptions, VersionInfo } from './types';
```

### Naming Conventions

```typescript
// Files: kebab-case
binary-manager.ts
config-generator.ts
init-command.ts

// Classes/Interfaces: PascalCase
class BinaryManager {}
interface WalrusConfig {}
type DeployOptions = {};

// Functions/variables: camelCase
async function downloadBinary() {}
const siteBuilder = new BinaryManager();

// Constants: SCREAMING_SNAKE_CASE
const DEFAULT_NETWORK = 'testnet';
const MAX_RETRY_ATTEMPTS = 3;

// Private members: prefix with _
class KeyStore {
  private _encryptedKey: string;
  private _decrypt(): string {}
}

// Async functions: prefix 'async'
async function fetchPackageId() {}
async function uploadBlob() {}
```

### Type Safety

```typescript
// ❌ AVOID
function process(data: any) {
  return data.field;  // No type safety
}

// ✅ PREFER: Specific types
interface BlobData {
  id: string;
  size: number;
}

function process(data: BlobData): string {
  return data.id;
}

// ✅ PREFER: Unknown with type guards
function process(data: unknown): string {
  if (isValidBlobData(data)) {
    return data.id;
  }
  throw new Error('Invalid data');
}

// ✅ PREFER: Generics
function fetchData<T>(url: string): Promise<T> {
  return axios.get<T>(url).then(res => res.data);
}
```

### Error Handling

```typescript
// ✅ CORRECT PATTERN (from CCS error-handler.ts)
class WalrusError extends Error {
  constructor(
    public code: string,
    message: string,
    public recoverable: boolean = false
  ) {
    super(message);
    this.name = 'WalrusError';
  }
}

// Usage
try {
  await downloadBinary();
} catch (error) {
  if (error instanceof WalrusError) {
    console.error(chalk.red(`[!] ${error.message}`));
    if (error.recoverable) {
      console.log(chalk.yellow('Suggestion:', getFixSuggestion(error.code)));
    }
    process.exit(getExitCode(error.code));
  }
  // Unexpected errors
  console.error(chalk.red('[X] Unexpected error:'), error);
  process.exit(1);
}

// Exit codes (consistent with CCS)
const EXIT_CODES = {
  SUCCESS: 0,
  GENERAL_ERROR: 1,
  INVALID_CONFIG: 2,
  NETWORK_ERROR: 3,
  AUTH_ERROR: 4,
  USER_CANCELLED: 130,
} as const;
```

### Async Patterns

```typescript
// ✅ PREFER: Promise.all for parallel
const [config, wallet, binary] = await Promise.all([
  loadConfig(),
  loadWallet(),
  checkBinary(),
]);

// ✅ PREFER: p-limit for controlled concurrency
import pLimit from 'p-limit';
const limit = pLimit(5);
const uploads = files.map(file => 
  limit(() => uploadBlob(file))
);
await Promise.all(uploads);

// ✅ PREFER: Explicit error handling
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(2 ** i * 1000); // Exponential backoff
    }
  }
  throw new Error('Unreachable');
}
```

## Terminal Output Standards

**ASCII ONLY - NO EMOJIS**

```typescript
// ✅ CORRECT
console.log('[OK] Setup complete');
console.log('[!] Warning: Low disk space');
console.log('[X] Error: Binary not found');
console.log('[i] Info: Using testnet');

// ❌ WRONG
console.log('✅ Setup complete');
console.log('⚠️ Warning: Low disk space');
```

**Color Guidelines:**
- TTY detection before using colors
- Respect `NO_COLOR` environment variable
- Use chalk library (same as CCS)

```typescript
import chalk from 'chalk';

// Check TTY
const useColor = process.stdout.isTTY && !process.env.NO_COLOR;

// Apply conditionally
const success = useColor ? chalk.green : (s: string) => s;
console.log(success('[OK] Deployed successfully'));
```

## File Organization

```
src/
├── commands/           # CLI commands (init, deploy, versions, domain)
├── binary/            # site-builder binary management
├── config/            # Configuration loading/generation
├── wallet/            # Encrypted keystore management
├── deploy/            # Deployment logic (diff, upload, publish)
├── versions/          # Version tracking and rollback
├── diagnostics/       # Health checks (walrus diagnose)
├── utils/             # Shared utilities
│   ├── prompt.ts      # Interactive prompts
│   ├── progress.ts    # Progress bars
│   └── ui/            # Terminal UI components
├── errors/            # Error handling
└── types/             # TypeScript type definitions
```

## Reference CCS Patterns

**Before implementing ANY feature, study these CCS files:**

1. **Commands:** `ccs/src/commands/setup-command.ts` - Interactive wizard
2. **Binary Management:** `ccs/src/cliproxy/binary/binary-manager.ts`
3. **Config Generation:** `ccs/src/cliproxy/config-generator.ts`
4. **Health Checks:** `ccs/src/management/doctor.ts`
5. **Prompts:** `ccs/src/utils/prompt.ts`
6. **UI Components:** `ccs/src/utils/ui/`

**Copy verbatim (with attribution):**
- Error handling patterns
- Platform detection logic
- Progress indicators
- Interactive prompts

## Common Patterns

### CLI Command Structure

```typescript
// Pattern from CCS commands/
export async function initCommand(options: InitOptions): Promise<void> {
  try {
    // 1. Validate inputs
    validateOptions(options);
    
    // 2. Pre-flight checks
    await runPreflightChecks();
    
    // 3. Execute main logic
    await executeSetup(options);
    
    // 4. Display results
    displaySuccess();
  } catch (error) {
    handleError(error);
  }
}
```

### Configuration Template Pattern

```typescript
// Pattern from CCS config-generator.ts
const template = await fs.readFile('config/template.yaml', 'utf-8');
const config = template
  .replace('{{NETWORK}}', network)
  .replace('{{PACKAGE_ID}}', await fetchLatestPackageId())
  .replace('{{WALLET}}', wallet.address);
await fs.writeFile(configPath, config);
```

### Multi-Step Progress

```typescript
// Pattern from CCS utils/ui/tasks.ts
import Listr from 'listr2';

const tasks = new Listr([
  {
    title: 'Detecting OS',
    task: async () => await detectOS(),
  },
  {
    title: 'Downloading binary',
    task: async (ctx, task) => {
      await downloadBinary({
        onProgress: (percent) => {
          task.output = `Progress: ${percent}%`;
        },
      });
    },
  },
]);

await tasks.run();
```

## Security Requirements

1. **Never log sensitive data** - Private keys, API tokens
2. **Encrypt keystore** - AES-256-CBC, PBKDF2 100k iterations
3. **File permissions** - Keystore files `0600` (owner read/write only)
4. **Input validation** - Sanitize all user inputs before shell execution
5. **No hardcoded secrets** - Use environment variables or config

```typescript
// Keystore encryption pattern
import crypto from 'crypto';

function encryptKey(privateKey: string, password: string): string {
  const salt = crypto.randomBytes(16);
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  
  let encrypted = cipher.update(privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return JSON.stringify({
    salt: salt.toString('hex'),
    iv: iv.toString('hex'),
    encrypted,
  });
}
```

## Pre-Commit Checklist

- [ ] `npm run format` - Format code
- [ ] `npm run lint:fix` - Fix linting
- [ ] `npm run validate` - All checks pass
- [ ] Conventional commit format (`feat:`, `fix:`, etc.)
- [ ] Updated tests if behavior changed
- [ ] No `any` types (use `unknown` or specific types)
- [ ] No non-null assertions (`!`)
- [ ] ASCII only (no emojis in output)
- [ ] Error messages helpful and actionable

## Prohibited Patterns

```typescript
// ❌ NEVER DO THESE
const data: any = await fetch();              // Use specific types
const user = maybeUser!;                       // Use optional chaining
console.log('✅ Done');                        // Use [OK] instead
process.exit(1);                               // Use error handler
fs.writeFileSync();                            // Use async fs.promises
child_process.exec(`rm -rf ${userInput}`);     // Sanitize inputs
```

## Questions?

Refer to:
- **CCS Reference:** `./ccs/` folder - Proven patterns
- **Requirements:** `./docs/requirements/` - POC specifications (PRD.md, main_function.md, etc.)
- **Brainstorm Report:** `./plans/reports/brainstorm-260117-0855-walruscli-ccs-reference-mapping.md`
