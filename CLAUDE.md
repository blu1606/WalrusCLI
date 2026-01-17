# CLAUDE.md - Desktop UI Branch

AI-facing guidance for Claude Code when working on **Desktop UI implementation only**.

## ⚠️ BRANCH SCOPE RESTRICTIONS

**YOU ARE ON: `feature/desktop-ui`**

### ✅ YOU CAN MODIFY:
- `apps/desktop/**` (YOUR EXCLUSIVE SCOPE)
- Documentation: `docs/**` (Desktop-specific docs only)

### ❌ YOU CANNOT MODIFY:
- `apps/cli/**` (CLI team's exclusive scope)
- `packages/core/**` (CLI team owns - **READ-ONLY for you**)
- Root configs: `package.json`, `pnpm-workspace.yaml` (without coordination)
- `.gitignore`, `.github/**` (without team discussion)

### ⚠️ READ-ONLY DEPENDENCIES:
- **`packages/core/`** - You can import and use these APIs but NEVER modify them
- If you need changes to core APIs, create an issue and request CLI team to implement
- Never write to `~/.walrus/*` files (CLI owns this state)

## Current Task (Week 4-5)

**Phase 1-4 from `apps/desktop/BRANCH_README.md`:**
1. Tauri v2 setup (Rust backend, React frontend)
2. Domain management UI (SuiNS lookup, domain registration form)
3. Deployment dashboard (deployment history, version rollback UI)
4. Settings panel (wallet management, network switching)

**CLI team dependency:** Wait until Week 4 when `packages/core/` APIs are stable.

## Reference Documentation

**MANDATORY READING BEFORE CODING:**
- `./apps/desktop/BRANCH_README.md` - Your task breakdown (4 phases)
- `./AGENTS.md` - Code standards, TypeScript rules
- `./docs/TEAM_WORKFLOW.md` - Branch workflow, file ownership
- `./docs/requirements/PRD.md` - Product requirements
- `./docs/design-guidelines.md` - UI/UX guidelines
- `./docs/wireframes/` - Desktop UI mockups

## Quality Gates (MANDATORY)

**Pre-Commit Sequence:**
```bash
npm run format              # Step 1: Fix formatting
npm run lint:fix            # Step 2: Fix linting
npm run validate            # Step 3: Verify ALL (MUST PASS)
```

## Code Standards

**Full standards in AGENTS.md** - Read before coding.

### Key Rules:
- ✅ TypeScript strict mode
- ✅ No `any` types (use `unknown` or specific types)
- ✅ No non-null assertions (`!`)
- ✅ React functional components with hooks
- ✅ Tailwind CSS for styling (no inline styles)
- ✅ Conventional commits (`feat:`, `fix:`, etc.)

### React Patterns:
```typescript
// ✅ CORRECT - Functional component with TypeScript
interface DomainFormProps {
  onSubmit: (domain: string) => void;
}

export const DomainForm: React.FC<DomainFormProps> = ({ onSubmit }) => {
  const [domain, setDomain] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(domain);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Tailwind classes, no inline styles */}
    </form>
  );
};

// ❌ WRONG - Class component
class DomainForm extends React.Component { }

// ❌ WRONG - Inline styles
<div style={{ color: 'red' }}>Error</div>
```

### Tauri Invoke Pattern:
```typescript
import { invoke } from '@tauri-apps/api/tauri';

// Frontend calls Rust backend
async function lookupDomain(name: string): Promise<DomainInfo> {
  try {
    const result = await invoke<DomainInfo>('lookup_suins_domain', { name });
    return result;
  } catch (error) {
    console.error('Domain lookup failed:', error);
    throw error;
  }
}
```

## Architecture

### Project Structure (Desktop Focus)
```
apps/desktop/
├── src/                   # React frontend
│   ├── components/
│   │   ├── DomainManager/
│   │   │   ├── DomainForm.tsx
│   │   │   ├── DomainList.tsx
│   │   │   └── index.ts
│   │   ├── DeploymentDashboard/
│   │   │   ├── HistoryTable.tsx
│   │   │   ├── VersionSelector.tsx
│   │   │   └── index.ts
│   │   └── Settings/
│   │       ├── WalletPanel.tsx
│   │       ├── NetworkSelector.tsx
│   │       └── index.ts
│   ├── hooks/             # Custom React hooks
│   │   ├── useDomain.ts
│   │   └── useDeployment.ts
│   ├── utils/             # Frontend utilities
│   │   └── formatters.ts
│   ├── styles/            # Tailwind CSS
│   │   └── globals.css
│   ├── App.tsx            # Main React app
│   └── main.tsx           # Entry point
├── src-tauri/             # Rust backend
│   ├── src/
│   │   ├── commands/      # Tauri commands
│   │   │   ├── domain.rs
│   │   │   ├── deploy.rs
│   │   │   └── wallet.rs
│   │   ├── main.rs        # Tauri main
│   │   └── lib.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
└── package.json

packages/core/             # READ-ONLY
├── src/
│   ├── walrus/           # Import from here
│   ├── sui/              # Import from here
│   ├── site/             # Import from here
│   └── config/           # Import from here
```

### Your MVP Scope
1. `walrus domain` - Tauri UI for SuiNS domain management
2. Deployment dashboard - View deployment history
3. Version rollback UI - Visual rollback interface
4. Settings panel - Wallet/network management

**Note:** Core CLI commands (`init`, `deploy`, `versions`) are CLI team's scope.

## Using Core Package (READ-ONLY)

**You can import but NEVER modify:**

```typescript
// ✅ CORRECT - Import from core
import { WalrusClient } from '@walruscli/core';
import { loadConfig } from '@walruscli/core';

// Rust backend uses core via CLI invocation
#[tauri::command]
async fn get_deployment_history() -> Result<Vec<Deployment>, String> {
    // Call CLI commands or read ~/.walrus/* state
    // DO NOT write to ~/.walrus/* files
}

// ❌ WRONG - Modify core files
// Never edit packages/core/src/**
```

**If you need core changes:**
1. Create issue: "Request: Add `getDeploymentHistory()` to core"
2. Tag CLI team
3. Wait for implementation
4. Import the new API

## Security Requirements

1. **Never store private keys in frontend state** - Use Tauri secure storage
2. **Sanitize user inputs** - Prevent XSS
3. **Validate data from Rust backend** - Don't trust implicitly
4. **Use Tauri's permission system** - Restrict filesystem access

## Pre-Commit Checklist

**Quality (BLOCKERS):**
- [ ] `npm run format` - Formatting fixed
- [ ] `npm run validate` - All checks pass

**Code:**
- [ ] Conventional commit format (`feat(desktop):`)
- [ ] Tests added/updated if behavior changed
- [ ] No `any` types, no non-null assertions
- [ ] Tailwind CSS only (no inline styles)
- [ ] No modifications to `apps/cli/**` or `packages/core/**`

**Coordination:**
- [ ] If you need core API changes, create issue for CLI team
- [ ] Document dependencies in commit message

## Commit Message Format

```bash
# Desktop changes only
feat(desktop): add domain registration form
fix(desktop): handle network errors in dashboard

# Tauri backend
feat(desktop/tauri): add Rust command for SuiNS lookup
fix(desktop/tauri): prevent race condition in wallet load
```

## Daily Workflow

1. **Start day:**
   ```bash
   git checkout feature/desktop-ui
   git pull origin feature/desktop-ui
   git merge origin/main  # Get latest from main
   ```

2. **During work:**
   - Focus ONLY on `apps/desktop/**`
   - Import from `packages/core/` but never modify
   - Check `apps/desktop/BRANCH_README.md` for task list
   - Run Tauri dev: `cd apps/desktop && npm run tauri dev`

3. **Before commit:**
   ```bash
   npm run format
   npm run lint:fix
   npm run validate  # MUST PASS
   git add apps/desktop/
   git commit -m "feat(desktop): descriptive message"
   ```

4. **End of day:**
   ```bash
   git push origin feature/desktop-ui
   ```

5. **Weekly sync:**
   - Merge `main` into your branch to stay updated
   - Coordinate with CLI team on needed core API changes

## Common Patterns

### Tauri Command Definition (Rust)
```rust
// src-tauri/src/commands/domain.rs
#[tauri::command]
pub async fn lookup_suins_domain(name: String) -> Result<DomainInfo, String> {
    // Call CLI or use core library
    let domain = walrus_cli::lookup_domain(&name)
        .map_err(|e| e.to_string())?;
    
    Ok(DomainInfo {
        name: domain.name,
        owner: domain.owner,
        expires_at: domain.expires_at,
    })
}
```

### React Component with Tauri
```typescript
// src/components/DomainManager/DomainForm.tsx
import { invoke } from '@tauri-apps/api/tauri';

export const DomainForm: React.FC = () => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DomainInfo | null>(null);

  const handleLookup = async () => {
    setLoading(true);
    try {
      const info = await invoke<DomainInfo>('lookup_suins_domain', { name });
      setResult(info);
    } catch (error) {
      console.error('Lookup failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border rounded px-4 py-2"
        placeholder="Enter domain name"
      />
      <button
        onClick={handleLookup}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? 'Looking up...' : 'Lookup'}
      </button>
      {result && <DomainInfo data={result} />}
    </div>
  );
};
```

## UI/UX Guidelines

**Reference:** `./docs/design-guidelines.md` and `./docs/wireframes/`

### Design Principles:
1. **Clean and minimal** - Avoid clutter
2. **Responsive** - Works on different screen sizes
3. **Consistent** - Use shared components
4. **Accessible** - ARIA labels, keyboard navigation
5. **Loading states** - Show feedback for async operations

### Tailwind CSS Standards:
```typescript
// ✅ CORRECT - Semantic spacing, consistent colors
<div className="space-y-4 p-6 bg-gray-50 rounded-lg">
  <h2 className="text-xl font-semibold text-gray-900">Domain Manager</h2>
  <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
    Register
  </button>
</div>

// ❌ WRONG - Inline styles, magic numbers
<div style={{ padding: '23px', backgroundColor: '#f0f0f0' }}>
  <h2 style={{ fontSize: '19px', fontWeight: 600 }}>Domain Manager</h2>
</div>
```

## Testing

```bash
# Frontend tests (Vitest + React Testing Library)
npm test

# Tauri tests (Rust)
cd apps/desktop/src-tauri
cargo test

# E2E tests (Playwright - optional for MVP)
npm run test:e2e
```

## Questions?

1. **Task breakdown:** Check `./apps/desktop/BRANCH_README.md`
2. **Core APIs:** Check `packages/core/src/` (read-only)
3. **Requirements:** See `./docs/requirements/PRD.md`
4. **Design:** See `./docs/design-guidelines.md` and `./docs/wireframes/`
5. **Standards:** See `./AGENTS.md`
6. **Team workflow:** See `./docs/TEAM_WORKFLOW.md`
7. **Tauri docs:** https://tauri.app/v2/

## Remember

**You are building the Desktop UI that consumes CLI team's core APIs.**

Your role is to create a beautiful, intuitive interface for domain management and deployment visualization. Respect the division of labor:
- **CLI team:** Core business logic, CLI commands, `packages/core/`
- **Desktop team (YOU):** Tauri app, React UI, visual components

**Never modify `packages/core/` or `apps/cli/`.** Request changes via issues.
