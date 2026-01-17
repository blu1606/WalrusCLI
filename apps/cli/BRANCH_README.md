# CLI Implementation Branch

**Branch:** `feature/cli-implementation`  
**Focus:** Command-line interface implementation  
**Owner:** Developer 1

## Scope of Work

### Phase 1: Core CLI Structure (Week 1-2)

**Files to work on:**
```
apps/cli/
├── src/
│   ├── commands/
│   │   ├── init.ts          # walrus init command
│   │   ├── deploy.ts        # walrus deploy command
│   │   ├── versions.ts      # walrus versions command
│   │   └── diagnose.ts      # walrus diagnose command
│   ├── index.ts             # CLI entry point
│   └── types.ts             # TypeScript types
├── package.json
└── tsconfig.json

packages/core/
├── src/
│   ├── binary/              # Binary management
│   │   ├── binary-manager.ts
│   │   ├── downloader.ts
│   │   ├── installer.ts
│   │   └── platform-detector.ts
│   ├── config/              # Configuration
│   │   ├── config-loader.ts
│   │   └── config-generator.ts
│   ├── wallet/              # Keystore
│   │   ├── keystore.ts
│   │   └── encryption.ts
│   └── utils/               # Shared utilities
│       ├── prompt.ts
│       ├── progress.ts
│       └── ui/
```

### Tasks Breakdown

#### 1. Setup CLI Project (Day 1)
- [ ] Configure `apps/cli/package.json` with dependencies
- [ ] Setup TypeScript configuration
- [ ] Install dependencies: `commander`, `chalk`, `ora`, `inquirer`
- [ ] Create basic CLI entry point (`src/index.ts`)

#### 2. Binary Management (Day 2-3)
**Reference:** `ccs/src/cliproxy/binary/`
- [ ] Implement `platform-detector.ts` - detect OS/architecture
- [ ] Implement `downloader.ts` - download site-builder binary
- [ ] Implement `installer.ts` - install and verify binary
- [ ] Add progress indicators for downloads

#### 3. Init Command (Day 4-5)
**Reference:** `ccs/src/commands/setup-command.ts`
- [ ] Create interactive setup wizard
- [ ] Implement wallet creation/import
- [ ] Generate `sites-config.yaml`
- [ ] Verify installation with diagnostics

#### 4. Config Management (Day 6-7)
**Reference:** `ccs/src/cliproxy/config-generator.ts`
- [ ] Template-based config generation
- [ ] Fetch latest package ID from Walrus
- [ ] Validate configuration files

#### 5. Deploy Command (Week 2)
- [ ] Detect first deploy vs update
- [ ] Calculate file diff
- [ ] Upload blobs to Walrus
- [ ] Publish metadata to Sui
- [ ] Version tracking

#### 6. Versions Command (Week 2)
- [ ] List deployment history
- [ ] Implement rollback logic
- [ ] Version comparison

#### 7. Diagnose Command (Week 2)
**Reference:** `ccs/src/management/doctor.ts`
- [ ] System checks (OS, disk, dependencies)
- [ ] Wallet checks
- [ ] Network connectivity
- [ ] Config validation

## Development Guidelines

### CCS Reference Files to Study
```
ccs/src/commands/setup-command.ts       # Interactive wizard pattern
ccs/src/cliproxy/binary/binary-manager.ts # Binary management
ccs/src/cliproxy/config-generator.ts    # Config generation
ccs/src/management/doctor.ts            # Health diagnostics
ccs/src/utils/prompt.ts                 # Interactive prompts
ccs/src/utils/ui/                       # Terminal UI components
```

### Code Standards
- Follow `AGENTS.md` for coding guidelines
- ASCII only (NO emojis): `[OK]`, `[!]`, `[X]`, `[i]`
- TypeScript strict mode
- No `any` types, no `!` assertions
- Conventional commits: `feat(cli):`, `fix(cli):`

### Testing Strategy
```bash
# Unit tests
pnpm test:cli

# Manual testing
cd apps/cli
pnpm build
node dist/index.js init
```

### Dependencies to Install
```json
{
  "dependencies": {
    "commander": "^11.x",
    "chalk": "^5.x",
    "ora": "^7.x",
    "inquirer": "^9.x",
    "listr2": "^3.x",
    "axios": "^1.x",
    "yaml": "^2.x"
  }
}
```

## Integration Points with Desktop

**Shared Package:** `packages/core/`
- Binary management logic
- Config handling
- Wallet encryption
- Types and interfaces

**Communication:**
- CLI writes to `~/.walrus/` for state
- Desktop reads from `~/.walrus/` for display
- Both use `packages/core` for shared logic

## Branch Rules

1. **Only modify:**
   - `apps/cli/**`
   - `packages/core/**`
   - `docs/` (if needed)

2. **DO NOT modify:**
   - `apps/desktop/**` (Desktop team's scope)
   - Root config files without coordination

3. **Commit format:**
   ```bash
   git commit -m "feat(cli): implement init command wizard"
   git commit -m "feat(core): add binary downloader with progress"
   ```

4. **Before merging to main:**
   - Run `pnpm validate` 
   - Ensure all tests pass
   - Create PR for review

## Getting Started

```bash
# Checkout this branch
git checkout feature/cli-implementation

# Install dependencies
pnpm install

# Start development
cd apps/cli
pnpm dev

# Run tests
pnpm test
```

## Progress Tracking

Track your progress in: `plans/cli-progress.md`

Update daily:
- Completed tasks
- Blockers
- Questions for team sync

## Questions?

- **Reference patterns:** See `ccs/` folder
- **Requirements:** See `docs/requirements/`
- **Code standards:** See `AGENTS.md`
- **Sync with Desktop team:** Daily standup or async updates
