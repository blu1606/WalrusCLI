# CLAUDE.md - CLI Implementation Branch

AI-facing guidance for Claude Code when working on **CLI implementation only**.

## ⚠️ BRANCH SCOPE RESTRICTIONS

**YOU ARE ON: `feature/cli-implementation`**

### ✅ YOU CAN MODIFY:
- `apps/cli/**` (PRIMARY SCOPE)
- `packages/core/**` (Primary owner - you own the core APIs)
- Root config files (with caution): `package.json`, `pnpm-workspace.yaml`
- Documentation: `docs/**`, `AGENTS.md`, `plans/**`

### ❌ YOU CANNOT TOUCH:
- `apps/desktop/**` (Desktop team's exclusive scope)
- `.gitignore`, `.github/**` (without team discussion)

### ⚠️ COORDINATION REQUIRED:
- **Changes to `packages/core/` public APIs** must be communicated to Desktop team
- **Breaking changes to shared interfaces** require approval from both teams
- **New dependencies** in `packages/core/` must be justified (bloat affects Desktop)

## Current Task (Week 1-3)

**Phase 1-3 from `apps/cli/BRANCH_README.md`:**
1. Binary management (site-builder download, verification, platform detection)
2. Init command (interactive wizard, config generation, encrypted keystore)
3. Deploy command (diff detection, blob upload, object ID publishing)

**Desktop team dependency:** They need stable `packages/core/` APIs by Week 4. Focus on API design.

## Reference Documentation

**MANDATORY READING BEFORE CODING:**
- `./apps/cli/BRANCH_README.md` - Your task breakdown (7 phases)
- `./AGENTS.md` - Code standards, CCS file mapping, pre-commit rules
- `./docs/TEAM_WORKFLOW.md` - Branch workflow, file ownership
- `./docs/requirements/PRD.md` - Product requirements
- `./plans/reports/brainstorm-260117-0855-walruscli-ccs-reference-mapping.md` - CCS reference

**CCS Reference:** Local folder at `./ccs/`

## Quality Gates (MANDATORY)

**Pre-Commit Sequence:**
```bash
pnpm run format              # Step 1: Fix formatting
pnpm run lint:fix            # Step 2: Fix linting
pnpm run validate            # Step 3: Verify ALL (MUST PASS)
```

**Why this order:** `validate` runs `format:check` which only verifies. If it fails, you skipped Step 1.

<<<<<<< Updated upstream
=======
## Development Workflow

### Setup
```bash
git clone <repo>
pnpm install
pnpm run build
```

### Development
```bash
pnpm run dev                 # Build + watch mode (all packages)
pnpm test                    # Run tests
pnpm run validate            # Full quality check
```

### Testing
```bash
pnpm test                    # All tests
pnpm run test:unit           # Unit tests only
pnpm run test:integration    # Integration tests

# Single test
pnpm test -- packages/core/tests/walrus-binary.test.ts
```

>>>>>>> Stashed changes
## Code Standards

**Full standards in AGENTS.md** - Read before coding.

### Key Rules:
- ✅ TypeScript strict mode
- ✅ No `any` types (use `unknown` or specific types)
- ✅ No non-null assertions (`!`)
- ✅ ASCII only - NO EMOJIS
- ✅ Conventional commits (`feat:`, `fix:`, etc.)

### Output Format:
```typescript
// ✅ CORRECT
console.log('[OK] Deployment successful');
console.log('[!] Warning: Low disk space');
console.log('[X] Error: Binary not found');

// ❌ WRONG - NO EMOJIS
console.log('✅ Deployment successful');
console.log('⚠️ Warning: Low disk space');
```

## Architecture

<<<<<<< Updated upstream
### Project Structure (CLI Focus)
```
apps/cli/
├── src/
│   ├── commands/           # CLI commands (init, deploy, versions, diagnose)
│   │   ├── init.ts
│   │   ├── deploy.ts
│   │   ├── versions.ts
│   │   └── diagnose.ts
│   ├── utils/             # CLI-specific utilities
│   │   ├── prompts.ts     # Interactive prompts
│   │   ├── progress.ts    # Progress bars
│   │   └── ui.ts          # Terminal UI components
│   ├── index.ts           # CLI entry point (Commander.js)
│   └── errors.ts          # CLI-specific error handling
├── tests/                 # CLI command tests
└── package.json

packages/core/
├── src/
│   ├── walrus/            # YOU OWN THIS
│   │   ├── binary-manager.ts  # Binary download/verification
│   │   └── client.ts          # Walrus API client
│   ├── sui/               # YOU OWN THIS
│   │   └── index.ts       # Sui blockchain client
│   ├── site/              # YOU OWN THIS
│   │   └── index.ts       # Site building logic
│   ├── config/            # YOU OWN THIS
│   │   └── index.ts       # Config loading/validation
│   └── logging/           # YOU OWN THIS
│       └── index.ts       # Shared logger
└── package.json
=======
### Project Structure (Monorepo)

The project is organized as a pnpm workspace:

- **`packages/core`**: Core logic and shared utilities.
  - `src/walrus/`: Walrus interactions and binary management.
  - `src/sui/`: Sui blockchain interactions.
  - `src/config/`: Configuration handling.
  - `src/site/`: Site-specific logic.
- **`apps/cli`**: Command-line interface.
  - Depends on `@walrus/core`.
  - Uses `commander` for command parsing.
- **`apps/desktop`**: Tauri-based desktop application (In progress).

```
packages/core/src/
├── walrus/            # binary management & wrappers
├── sui/               # Sui client & interactions
├── config/            # Configuration loading/generation
├── site/              # Site deployment logic
├── logging/           # Centralized logging
└── index.ts           # Public API

apps/cli/
├── bin/               # Executable entry point
└── src/               # Command implementations
>>>>>>> Stashed changes
```

### MVP Scope (Option B)
1. `walrus init` - Interactive setup wizard
2. `walrus deploy` - Deploy/update websites using `site-builder` wrapper (Publish/Update logic)
3. `walrus versions --list/--rollback` - Version management
4. `walrus diagnose` - System health checks

**Note:** Domain management (`walrus domain`) is Desktop team's scope.

## Integration Strategy (Best Practices)

### Binary Management
- **Resolution Order:**
  1. System PATH (`site-builder`)
  2. Local Cache (`~/.walrus/bin/site-builder`)
- **Action:** If system binary exists, use it. If not, download managed version.

### Configuration & State
- **Hybrid Model:**
  - `walrus.config.json`: Static build config (dir, epochs)
  - `.env`: Dynamic state (`WALRUS_SITE_OBJECT_ID`)
- **Reasoning:** Improves DX by exposing Site ID to frontend code automatically.

### Deployment Logic
- **Wrap vs Reimplement:** Always prefer wrapping official binary commands (`publish`, `update`) over reimplementing complex logic (diffing, merkle trees).
- **Pre-flight Check:** Always verify WAL balance before running `site-builder`. If balance is 0, offer to run `get-wal` (Suibase) or provide instructions.
- **Parsing:** Use Regex to reliably extract data from CLI stdout.
  - Pattern: `/New site object ID: (.+)/`

## Common Patterns (from CCS)

### CLI Command Structure
```typescript
export async function initCommand(options: InitOptions): Promise<void> {
  try {
    validateOptions(options);
    await runPreflightChecks();
    await executeMainLogic(options);
    displaySuccess();
  } catch (error) {
    handleError(error);
  }
}
```

### Error Handling
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

// Usage
throw new WalrusError('BINARY_NOT_FOUND', 'site-builder binary not found', true);
```

### Multi-Step Progress
```typescript
import Listr from 'listr2';

const tasks = new Listr([
  { title: 'Detecting OS', task: async () => await detectOS() },
  { title: 'Downloading binary', task: async () => await downloadBinary() },
]);

await tasks.run();
```

## Security Requirements

1. **Never log sensitive data** - Private keys, passwords
2. **Encrypt keystore** - AES-256-CBC with PBKDF2
3. **File permissions** - Keystore files `0600`
4. **Input validation** - Sanitize before shell execution
5. **No hardcoded secrets** - Use environment variables

## Pre-Commit Checklist

**Quality (BLOCKERS):**
- [ ] `npm run format` - Formatting fixed
- [ ] `npm run validate` - All checks pass

**Code:**
- [ ] Conventional commit format (`feat(cli):`, `feat(core):`)
- [ ] Tests added/updated if behavior changed
- [ ] No `any` types, no non-null assertions
- [ ] ASCII only (no emojis)
- [ ] No modifications to `apps/desktop/**`

**Coordination:**
- [ ] If `packages/core/` API changed, notify Desktop team
- [ ] If breaking change, document in commit message

## Commit Message Format

```bash
# CLI changes
feat(cli): add init command with interactive wizard
fix(cli): handle missing binary gracefully

# Core changes
feat(core): add WalrusBinaryManager class
fix(core): prevent race condition in config loader

# Both
feat(cli,core): implement encrypted keystore with AES-256
```

## Daily Workflow

1. **Start day:**
   ```bash
   git checkout feature/cli-implementation
   git pull origin feature/cli-implementation
   git merge origin/main  # Get latest from main
   ```

2. **During work:**
   - Focus on `apps/cli/**` and `packages/core/**`
   - Check `apps/cli/BRANCH_README.md` for task list
   - Run tests frequently: `npm test`

3. **Before commit:**
   ```bash
   npm run format
   npm run lint:fix
   npm run validate  # MUST PASS
   git add .
   git commit -m "feat(cli): descriptive message"
   ```

4. **End of day:**
   ```bash
   git push origin feature/cli-implementation
   ```

5. **Weekly sync:**
   - Merge `main` into your branch to stay updated
   - Coordinate with Desktop team on `packages/core/` changes

## Questions?

1. **Task breakdown:** Check `./apps/cli/BRANCH_README.md`
2. **Code patterns:** Check `./ccs/` reference codebase
3. **Requirements:** See `./docs/requirements/PRD.md` and `./docs/requirements/main_function.md`
4. **Architecture:** See `./plans/reports/brainstorm-260117-0855-walruscli-ccs-reference-mapping.md`
5. **Standards:** See `./AGENTS.md`
6. **Team workflow:** See `./docs/TEAM_WORKFLOW.md`

## Remember

**You are building the CLI application and owning the core business logic.**

Desktop team depends on your `packages/core/` APIs being stable and well-documented. Prioritize:
1. **Clean API design** - They'll consume your interfaces
2. **Thorough testing** - Bugs affect both teams
3. **Clear documentation** - TSDoc comments for all exported functions
4. **Stable releases** - Avoid breaking changes after Week 3
