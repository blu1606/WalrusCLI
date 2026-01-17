# Team Work Distribution

## Branch Strategy

### Main Branch
- **`main`** - Production-ready code
- Protected branch, requires PR for merging

### Feature Branches

#### 1. CLI Implementation
- **Branch:** `feature/cli-implementation`
- **Owner:** Developer 1
- **Timeline:** Week 1-3
- **Focus:** Command-line interface

**Scope:**
- `apps/cli/` - All CLI commands
- `packages/core/` - Shared business logic
- Binary management, wallet, config

**Guide:** See `apps/cli/BRANCH_README.md`

#### 2. Desktop UI
- **Branch:** `feature/desktop-ui`
- **Owner:** Developer 2
- **Timeline:** Week 4-5
- **Focus:** Tauri desktop application

**Scope:**
- `apps/desktop/` - React + Tauri app
- Domain management UI
- Wallet integration via IPC

**Guide:** See `apps/desktop/BRANCH_README.md`

## Workflow

### Getting Started

**Developer 1 (CLI):**
```bash
git checkout feature/cli-implementation
pnpm install
cd apps/cli
pnpm dev
```

**Developer 2 (Desktop):**
```bash
git checkout feature/desktop-ui
pnpm install
cd apps/desktop
pnpm tauri dev
```

### Daily Workflow

```bash
# 1. Start of day: sync with main
git checkout feature/cli-implementation  # or feature/desktop-ui
git pull origin main
git merge main

# 2. Work on your tasks
# ... make changes ...

# 3. Commit your work
git add .
git commit -m "feat(cli): add init command"

# 4. Push to remote
git push origin feature/cli-implementation
```

### Integration Points

Both branches share `packages/core/`:
- **CLI team** implements core logic
- **Desktop team** consumes core logic
- Coordinate changes via PRs

**Example coordination:**
```bash
# CLI team adds new wallet function
git checkout feature/cli-implementation
# ... implement in packages/core/src/wallet/keystore.ts ...
git commit -m "feat(core): add wallet decryption method"
git push

# Desktop team uses the function
git checkout feature/desktop-ui
git merge feature/cli-implementation  # Get latest core changes
# ... use the new wallet function ...
```

## Avoiding Conflicts

### File Ownership

**CLI Team (Developer 1):**
- ✅ `apps/cli/**`
- ✅ `packages/core/**` (primary owner)
- ❌ `apps/desktop/**`

**Desktop Team (Developer 2):**
- ✅ `apps/desktop/**`
- ⚠️ `packages/core/**` (read/consume, coordinate changes)
- ❌ `apps/cli/**`

**Shared (both teams):**
- ⚠️ `docs/` - coordinate updates
- ⚠️ `plans/` - separate progress files

### Communication Protocol

**Daily Sync (Async):**
- Update progress in respective files:
  - CLI: `plans/cli-progress.md`
  - Desktop: `plans/desktop-progress.md`

**When to sync:**
- Before modifying `packages/core/`
- When desktop needs new core functionality
- Before merging to main

**Sync methods:**
- GitHub PR comments
- Team chat
- Quick calls for complex changes

## Merge Strategy

### Phase 1: CLI First
```bash
# Week 3: CLI ready
git checkout feature/cli-implementation
# Create PR: feature/cli-implementation → main
# Review → Merge to main
```

### Phase 2: Desktop After CLI
```bash
# Week 5: Desktop ready
git checkout feature/desktop-ui
git merge main  # Get CLI code
# Create PR: feature/desktop-ui → main
# Review → Merge to main
```

### Alternative: Parallel Merge
If both ready at same time:
1. CLI merges first (less dependencies)
2. Desktop rebases on updated main
3. Desktop merges

## Testing Integration

### CLI Tests
```bash
cd apps/cli
pnpm test
```

### Desktop Tests
```bash
cd apps/desktop
pnpm tauri build --debug
# Manual testing on each platform
```

### Integration Test (after both merged)
```bash
# 1. CLI creates site
cd apps/cli
node dist/index.js init
node dist/index.js deploy ./test-site

# 2. Desktop manages domain
cd apps/desktop
pnpm tauri dev
# Search domain → Link to site created by CLI
```

## Branch Checklist

### Before Starting Work
- [ ] Branch is up-to-date with main
- [ ] Read your `BRANCH_README.md`
- [ ] Review reference CCS files
- [ ] Dependencies installed

### Before Pushing
- [ ] Code follows `AGENTS.md` standards
- [ ] Conventional commit format
- [ ] Tests pass (if applicable)
- [ ] No changes to other team's files

### Before Merging to Main
- [ ] All tasks in branch guide completed
- [ ] `pnpm validate` passes
- [ ] PR created and reviewed
- [ ] Conflicts resolved
- [ ] Tests pass on CI

## Progress Tracking

### Week 1-2: CLI Foundation
**Developer 1:**
- Binary management ✓
- Init command ✓
- Config generation ✓

### Week 2-3: CLI Features
**Developer 1:**
- Deploy command ✓
- Versions command ✓
- Diagnose command ✓

### Week 4-5: Desktop UI
**Developer 2:**
- Tauri setup ✓
- Domain search UI ✓
- Wallet integration ✓
- Domain linking ✓

### Week 6: Integration
**Both:**
- Merge branches
- Integration testing
- Bug fixes
- Documentation

## Quick Reference

### Branch Commands
```bash
# List all branches
git branch -a

# Switch branches
git checkout feature/cli-implementation
git checkout feature/desktop-ui

# Sync with main
git merge main

# Push your branch
git push origin feature/cli-implementation
```

### Helpful Commands
```bash
# See what changed in other branch
git diff main..feature/desktop-ui

# Cherry-pick a commit from other branch
git cherry-pick <commit-hash>

# Resolve conflicts
git status  # See conflicted files
# Edit files to resolve
git add .
git commit
```

## Contact Points

**Blockers?**
- Post in team chat
- Create GitHub issue
- Tag team member in PR

**Need core package change?**
- CLI team: Implement and push
- Desktop team: Create issue/request
- Coordinate in PR comments

**Ready to merge?**
- Create PR with description
- Request review from other dev
- Wait for approval
- Squash and merge
