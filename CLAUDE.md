# CLAUDE.md

AI-facing guidance for Claude Code when working with WalrusCLI.

## Project Overview

**WalrusCLI** - TypeScript/Node.js CLI tool for deploying websites to Walrus Sites (decentralized web hosting on Sui blockchain). Simplifies the complex manual deployment process into intuitive commands.

## Reference Codebase

**PRIMARY REFERENCE:** Local CCS codebase at `./ccs/`

This project mirrors the architecture and patterns from [kaitranntt/ccs](https://github.com/kaitranntt/ccs) (Claude Code Switch). The CCS codebase is a battle-tested CLI tool with similar requirements:
- Binary management across platforms
- Interactive setup wizards
- Configuration generation
- Health diagnostics
- Terminal UI components

**IMPORTANT:** Before implementing ANY feature, study the corresponding CCS files documented in:
- `./plans/reports/brainstorm-260117-0855-walruscli-ccs-reference-mapping.md` (Complete reference mapping)
- `./AGENTS.md` (Code standards and patterns)

**Key CCS Files to Study:**
```
ccs/src/commands/setup-command.ts           # Interactive wizard
ccs/src/cliproxy/binary/binary-manager.ts   # Binary downloads
ccs/src/cliproxy/config-generator.ts        # Auto-config
ccs/src/management/doctor.ts                # Health checks
ccs/src/utils/prompt.ts                     # Interactive prompts
ccs/src/utils/ui/                           # Terminal UI
```

## Core Principles

### Technical Excellence
- **YAGNI**: Build only what's needed for MVP
- **KISS**: Simple solutions over clever ones
- **DRY**: Single source of truth

### User Experience
- **CLI-First**: All features accessible via terminal
- **Progressive Disclosure**: Simple by default, power features available
- **Helpful Errors**: Every error suggests a fix

## Quality Gates (MANDATORY)

**Pre-Commit Sequence:**
```bash
npm run format              # Step 1: Fix formatting
npm run lint:fix            # Step 2: Fix linting
npm run validate            # Step 3: Verify ALL (MUST PASS)
```

**Why this order:** `validate` runs `format:check` which only verifies. If it fails, you skipped Step 1.

## Development Workflow

### Setup
```bash
git clone <repo>
npm install
npm run build
```

### Development
```bash
npm run dev                 # Build + watch mode
npm test                    # Run tests
npm run validate            # Full quality check
```

### Testing
```bash
npm test                    # All tests
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests

# Single test
npm test -- tests/unit/binary/downloader.test.ts
npm test -- -t "downloads binary successfully"
```

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

### Project Structure
```
src/
├── commands/           # CLI commands (init, deploy, versions, domain)
├── binary/            # site-builder binary management
├── config/            # Configuration loading/generation
├── wallet/            # Encrypted keystore management
├── deploy/            # Deployment logic
├── versions/          # Version tracking
├── diagnostics/       # Health checks
├── utils/             # Shared utilities
└── errors/            # Error handling
```

### MVP Scope (Option B)
1. `walrus init` - Interactive setup wizard
2. `walrus deploy` - Deploy/update websites with smart diff
3. `walrus versions --list/--rollback` - Version management
4. `walrus domain` - Tauri UI for SuiNS domain management
5. `walrus diagnose` - System health checks

**Deferred to v2.0:** CI/CD workflows, analytics dashboard

## Security Requirements

1. **Never log sensitive data** - Private keys, passwords
2. **Encrypt keystore** - AES-256-CBC with PBKDF2
3. **File permissions** - Keystore files `0600`
4. **Input validation** - Sanitize before shell execution
5. **No hardcoded secrets** - Use environment variables

## Common Patterns (from CCS)

### CLI Command Structure
```typescript
export async function myCommand(options: Options): Promise<void> {
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

## Documentation Requirements

**Update these when changing features:**
- [ ] Command help text (`--help`)
- [ ] README.md (user-facing changes)
- [ ] AGENTS.md (code patterns)
- [ ] Type definitions in `src/types/`

## Common Mistakes (AVOID)

| Mistake | Consequence | Fix |
|---------|-------------|-----|
| Running `validate` without `format` first | format:check fails | Run `npm run format` first |
| Using emojis in output | Breaks terminals | Use `[OK]`, `[!]`, `[X]` |
| Using `any` type | No type safety | Use `unknown` or specific type |
| Non-conventional commits | CI fails | Use `feat:`, `fix:`, etc. |
| Hardcoded values | Hard to maintain | Use constants or config |

## Pre-Commit Checklist

**Quality (BLOCKERS):**
- [ ] `npm run format` - Formatting fixed
- [ ] `npm run validate` - All checks pass

**Code:**
- [ ] Conventional commit format
- [ ] Tests added/updated if behavior changed
- [ ] No `any` types, no non-null assertions
- [ ] ASCII only (no emojis)

**Documentation:**
- [ ] Command help updated if CLI changed
- [ ] README.md updated if user-facing

## Error Handling Principles

- Validate early, fail fast with clear messages
- Show available options on mistakes
- Never leave broken state
- Suggest fixes for recoverable errors

## Questions?

1. **Code patterns:** Check `./ccs/` reference codebase
2. **Requirements:** See `./docs/requirements/PRD.md` and `./docs/requirements/main_function.md`
3. **Architecture:** See `./plans/reports/brainstorm-260117-0855-walruscli-ccs-reference-mapping.md`
4. **Standards:** See `./AGENTS.md`
